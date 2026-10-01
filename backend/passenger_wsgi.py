"""Passenger's entry file. The real setup is in wsgi.py.

cPanel ("Setup Python App") considers this file its own: when the app's settings are saved
it may regenerate it as a stub that loads the configured startup file (wsgi.py) with the
`imp` module. This file does the same thing without `imp` (removed in Python 3.12), so
either version works.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from wsgi import application  # noqa: E402,F401  (needs the path set above)
