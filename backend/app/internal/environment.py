import os
from typing import Optional

from dotenv import load_dotenv

# Load the .env file
load_dotenv()

# ENV values that mean "local development". The dev container sets ENV=development.
DEV_ENV_NAMES = {"dev", "development"}


def is_dev(env: Optional[str]) -> bool:
    """True only for an explicit development ENV value.

    Anything else, including an unset ENV (production has none), is treated as
    production, so production is secure by default.
    """
    return (env or "").strip().lower() in DEV_ENV_NAMES


ENV = os.getenv("ENV")
IS_DEV = is_dev(ENV)
