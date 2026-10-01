"""Smoke-test the backend exactly the way production loads it.

Passenger imports backend/passenger_wsgi.py, which wraps the FastAPI app (app.main) for
WSGI using a2wsgi. This script does the same and sends a few GET requests through that
WSGI `application`.

Run from the backend/ directory with the backend's environment variables set and a
reachable database:

    cd backend && python ../deploy/smoke_test.py [--init-schema]

--init-schema creates the tables that FastAPI's startup handler would create. Use it
against an empty database (CI). Under Passenger that startup handler never runs, so
production relies on its tables already existing.
"""
import os
import sys
from wsgiref.util import setup_testing_defaults

sys.path.insert(0, os.getcwd())
import passenger_wsgi  # noqa: E402  (must be imported after the path setup)

if "--init-schema" in sys.argv:
    from app.internal.db.init import (create_events_table, create_holidays_table,
                                      create_hours_table, create_users_table)
    from app.internal.db.session import get_db

    db = next(get_db())
    try:
        for create_table in (create_users_table, create_hours_table,
                             create_holidays_table, create_events_table):
            create_table(db)
    finally:
        db.close()

PATHS = [
    "/api/v1/hours/status",
    "/api/v1/hours",
    "/api/v1/holidays",
    "/api/v1/events",
]


def get(path):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": path, "QUERY_STRING": ""})
    result = {}

    def start_response(status, headers, exc_info=None):
        result["status"] = status

    body = b"".join(passenger_wsgi.application(environ, start_response))
    return result["status"], body


failed = False
for path in PATHS:
    status, body = get(path)
    ok = status.startswith("200")
    failed |= not ok
    print(f"{'OK  ' if ok else 'FAIL'} {status:<20} {path}  ({len(body)} bytes)")

sys.exit(1 if failed else 0)
