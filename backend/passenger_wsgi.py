"""Production entry point: Passenger (cPanel "Setup Python App") loads this file.

FastAPI is an ASGI app, but Passenger only speaks WSGI, so a2wsgi adapts it.
Passenger looks for a module-level `application`.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from a2wsgi import ASGIMiddleware  # noqa: E402  (needs the path set above)
from app.main import app  # noqa: E402

application = ASGIMiddleware(app)
