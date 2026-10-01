"""Production entry point.

cPanel's "Setup Python App" names this file (wsgi.py) as the application startup file,
and Passenger reaches it through passenger_wsgi.py. FastAPI is an ASGI app but Passenger
only speaks WSGI, so a2wsgi adapts it. Passenger uses the module-level `application`.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from a2wsgi import ASGIMiddleware  # noqa: E402  (needs the path set above)
from app.main import app  # noqa: E402

application = ASGIMiddleware(app)
