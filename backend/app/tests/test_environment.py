import importlib

import pytest

from app.internal import environment


@pytest.mark.parametrize("value", ["dev", "development", "Development", " dev "])
def test_explicit_dev_values_are_dev(value):
    assert environment.is_dev(value)


@pytest.mark.parametrize("value", [None, "", "prod", "production", "staging", "devel"])
def test_everything_else_is_production(value):
    assert not environment.is_dev(value)


def test_unset_env_means_production(monkeypatch):
    # Production (cPanel) sets no ENV at all, so the refresh cookie must be Secure there
    monkeypatch.delenv("ENV", raising=False)
    monkeypatch.setattr("dotenv.load_dotenv", lambda *a, **k: False)
    try:
        assert importlib.reload(environment).IS_DEV is False
    finally:
        monkeypatch.undo()
        importlib.reload(environment)
