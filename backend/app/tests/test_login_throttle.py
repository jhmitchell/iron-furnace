from unittest.mock import patch

import pytest

from app.internal import login_throttle as lt


@pytest.fixture(autouse=True)
def clean_state():
    lt.reset()
    yield
    lt.reset()


def fail(times, ip="1.2.3.4", username="admin"):
    for _ in range(times):
        lt.record_failure(ip, username)


def test_allows_until_account_limit():
    fail(lt.MAX_FAILURES_PER_ACCOUNT - 1)
    assert lt.retry_after("1.2.3.4", "admin") is None
    fail(1)
    wait = lt.retry_after("1.2.3.4", "admin")
    assert wait is not None and 0 < wait <= lt.WINDOW_SECONDS + 1


def test_username_is_normalized():
    fail(lt.MAX_FAILURES_PER_ACCOUNT, username="Admin")
    assert lt.retry_after("1.2.3.4", "  admin ") is not None


def test_other_ip_and_other_account_unaffected():
    fail(lt.MAX_FAILURES_PER_ACCOUNT)
    assert lt.retry_after("5.6.7.8", "admin") is None
    assert lt.retry_after("1.2.3.4", "someone-else") is None


def test_ip_limit_across_usernames():
    for i in range(lt.MAX_FAILURES_PER_IP):
        lt.record_failure("1.2.3.4", "user%d" % i)
    assert lt.retry_after("1.2.3.4", "brand-new-user") is not None


def test_unknown_ip_uses_account_limit_only():
    for i in range(lt.MAX_FAILURES_PER_IP + 5):
        lt.record_failure(None, "user%d" % i)
    # no shared "unknown" bucket that would block everyone
    assert lt.retry_after(None, "admin") is None
    fail(lt.MAX_FAILURES_PER_ACCOUNT, ip=None)
    assert lt.retry_after(None, "admin") is not None


def test_success_clears_account_counter():
    fail(lt.MAX_FAILURES_PER_ACCOUNT - 1)
    lt.record_success("1.2.3.4", "admin")
    fail(lt.MAX_FAILURES_PER_ACCOUNT - 1)
    assert lt.retry_after("1.2.3.4", "admin") is None


def test_failures_expire_after_window():
    with patch.object(lt.time, "monotonic", return_value=1000.0):
        fail(lt.MAX_FAILURES_PER_ACCOUNT)
        assert lt.retry_after("1.2.3.4", "admin") is not None
    with patch.object(lt.time, "monotonic", return_value=1000.0 + lt.WINDOW_SECONDS + 1):
        assert lt.retry_after("1.2.3.4", "admin") is None


def test_memory_is_bounded():
    with patch.object(lt, "MAX_TRACKED_KEYS", 50):
        for i in range(200):
            lt.record_failure("10.0.0.%d" % i, "user")
        # one account key + one IP key per call; pruning keeps it near the cap
        assert len(lt._failures) <= 52
