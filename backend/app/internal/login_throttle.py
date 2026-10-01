"""Lightweight, dependency-free brute-force protection for the login endpoint.

Failed sign-in attempts are counted in memory, per process, in a sliding time window:

* per (client IP, username): stops password guessing against one account from one place;
* per client IP: stops one client from spraying guesses across many usernames.

There is deliberately no lock on a username alone, so nobody can lock a real admin out
of their own account just by typing their username wrong from somewhere else.

Limits worth knowing:

* Counters live in the memory of one process. Passenger may run several processes and
  recycles idle ones, so the effective limit is "MAX_* per process" and counters reset
  when a process restarts. This slows guessing down a lot but is not a hard guarantee;
  a shared store (database table or cache) would be needed for that.
* The client IP is whatever the server reports as the peer address (REMOTE_ADDR under
  Passenger). Behind a proxy or CDN this would be the proxy's address, so all clients
  would share one IP budget. If the address is unknown, only the per-account limit
  is applied.
"""
import threading
import time
from collections import deque
from typing import Deque, Dict, Optional, Tuple

WINDOW_SECONDS = 15 * 60
MAX_FAILURES_PER_ACCOUNT = 5   # per (IP, username) within the window
MAX_FAILURES_PER_IP = 20       # per IP, across all usernames, within the window
MAX_TRACKED_KEYS = 10000       # bounds memory use if many distinct keys show up

_lock = threading.Lock()
_failures: Dict[Tuple[str, ...], Deque[float]] = {}


def _keys(ip: Optional[str], username: str) -> Tuple[Tuple[Tuple[str, ...], int], ...]:
    """The (key, limit) pairs that apply to a sign-in attempt."""
    account = (("acct", ip or "", username.strip().lower()), MAX_FAILURES_PER_ACCOUNT)
    if not ip:
        # Unknown client address: every client would share one IP bucket, so a single
        # attacker could block everyone's sign-in. Only the per-account limit applies.
        return (account,)
    return account, (("ip", ip), MAX_FAILURES_PER_IP)


def _recent(key: Tuple[str, ...], now: float) -> Deque[float]:
    """Return the failure timestamps for key, with entries older than the window dropped."""
    attempts = _failures.get(key)
    if attempts is None:
        return deque()
    while attempts and attempts[0] <= now - WINDOW_SECONDS:
        attempts.popleft()
    if not attempts:
        del _failures[key]
    return attempts


def _prune(now: float) -> None:
    for key in list(_failures):
        _recent(key, now)
    # Still too many (a flood of distinct keys): drop the oldest ones.
    if len(_failures) > MAX_TRACKED_KEYS:
        oldest_first = sorted(_failures, key=lambda k: _failures[k][-1])
        for key in oldest_first[: len(_failures) - MAX_TRACKED_KEYS]:
            del _failures[key]


def retry_after(ip: Optional[str], username: str) -> Optional[int]:
    """Seconds until this client may try again for this username, or None if allowed now."""
    now = time.monotonic()
    wait = 0.0
    with _lock:
        for key, limit in _keys(ip, username):
            attempts = _recent(key, now)
            if len(attempts) >= limit:
                # Allowed again once enough old failures have left the window.
                wait = max(wait, attempts[len(attempts) - limit] + WINDOW_SECONDS - now)
    return max(1, int(wait) + 1) if wait > 0 else None


def record_failure(ip: Optional[str], username: str) -> None:
    now = time.monotonic()
    with _lock:
        if len(_failures) >= MAX_TRACKED_KEYS:
            _prune(now)
        for key, _limit in _keys(ip, username):
            _failures.setdefault(key, deque()).append(now)


def record_success(ip: Optional[str], username: str) -> None:
    """A correct password clears that account's counter for this client (not the IP's)."""
    with _lock:
        _failures.pop(_keys(ip, username)[0][0], None)


def reset() -> None:
    """Forget all recorded failures (used by tests)."""
    with _lock:
        _failures.clear()
