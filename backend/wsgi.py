import os
import sys

sys.path.append(os.path.dirname(__file__))
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.main import app
from a2wsgi import ASGIMiddleware

application = ASGIMiddleware(app)

