import os
import logging
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.internal.db.users import create_user
from app.internal.token import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_and_create_table(db, query: str, table_name: str):
    query_check = f"SHOW TABLES LIKE '{table_name}';"
    result = db.execute(text(query_check))
    table_exists = result.fetchone()

    if not table_exists:
        db.execute(text(query))
        db.commit()
        logger.info(f"Table {table_name} created.")
    else:
        logger.info(f"Table {table_name} found.")


def create_users_table(db: Session):
    query = """
    CREATE TABLE IF NOT EXISTS users (
        member_id VARCHAR(255) NOT NULL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        hashed_password VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        disabled TINYINT(1) DEFAULT 0,
        refresh_token VARCHAR(255),
        refresh_token_expires_at DATETIME
    );
    """
    check_and_create_table(db, query, "users")


def create_hours_table(db: Session):
    query = """
    CREATE TABLE IF NOT EXISTS operating_hours (
        id INT PRIMARY KEY AUTO_INCREMENT,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        open_time TIME,
        close_time TIME
    );
    """
    check_and_create_table(db, query, "operating_hours")


def create_holidays_table(db: Session):
    query = """
    CREATE TABLE IF NOT EXISTS holidays (
        id INT PRIMARY KEY AUTO_INCREMENT,
        holiday_date DATE,
        description VARCHAR(255)
    );
    """
    check_and_create_table(db, query, "holidays")


def create_events_table(db: Session):
    query = """
    CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_start DATETIME NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        link_text VARCHAR(255),
        link_url VARCHAR(255)
    );
    """
    check_and_create_table(db, query, "events")


def create_root_user(db: Session):
    # Get root user information from environment variables
    root_username = os.getenv("ROOT_USERNAME")
    root_first_name = os.getenv("ROOT_FIRST_NAME")
    root_last_name = os.getenv("ROOT_LAST_NAME")
    root_email = os.getenv("ROOT_EMAIL")
    root_password = os.getenv("ROOT_PASSWORD")

    hashed_password = hash_password(root_password)

    result = create_user(
        db,
        root_username,
        root_email,
        hashed_password,
        root_first_name,
        root_last_name,
        True
    )

    if result['status'] == 'success':
        logger.info(f'Created root user {root_username}')
