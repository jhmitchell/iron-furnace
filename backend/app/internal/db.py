"""
Database Module

This module contains functions to interact with the MySQL database.
It includes functions to create, retrieve, update, delete, and authenticate users.
"""

import datetime
import pymysql
import os
from typing import Union
from .models import UserInDB
from passlib.context import CryptContext
from dotenv import load_dotenv

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
load_dotenv()


def connect_to_db():
    """Connects to the MySQL database and returns the connection object."""
    connection = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    return connection


def get_operating_hours():
    connection = connect_to_db()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT day_of_week, open_time, close_time FROM operating_hours")
    hours = cursor.fetchall()

    cursor.execute("SELECT holiday_date, description FROM holidays")
    holidays = cursor.fetchall()

    connection.close()

    # MySQL TIME objects are returned as datetime.timedelta objects
    # Convert them to datetime.time objects via a lambda function
    def to_time(value): return (datetime.datetime.min + value).time()

    # Define hours and holidays as dictionaries
    hours_dict = [{"day_of_week": day, "open_time": to_time(
        open_time), "close_time": to_time(close_time)} for day, open_time, close_time in hours]
    holidays_dict = [{"holiday_date": date, "description": desc}
                     for date, desc in holidays]

    return hours_dict, holidays_dict


def create_user(member_id: str, email: str, hashed_password: str, first_name: str, last_name: str, disabled: bool = False):
    connection = connect_to_db()
    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO users (member_id, first_name, last_name, email, hashed_password, disabled) VALUES (%s, %s, %s, %s, %s, %s)",
                       (member_id, first_name, last_name, email, hashed_password, disabled))
        connection.commit()
        return get_user(member_id)
    except pymysql.MySQLError:
        return None
    finally:
        connection.close()


def get_user(member_id: str) -> Union[UserInDB, None]:
    connection = connect_to_db()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE member_id = %s", (member_id,))
    user = cursor.fetchone()
    connection.close()
    if user:
        return UserInDB(**user)


def update_user(member_id: str, email=None, first_name=None, last_name=None, hashed_password=None, disabled=None):
    connection = connect_to_db()
    cursor = connection.cursor()
    try:
        query = "UPDATE users SET "
        params = []

        # Update fields if provided
        if email:
            query += "email = %s, "
            params.append(email)
        if first_name:
            query += "first_name = %s, "
            params.append(first_name)
        if last_name:
            query += "last_name = %s, "
            params.append(last_name)
        if hashed_password:
            query += "hashed_password = %s, "
            params.append(hashed_password)
        if disabled is not None:
            query += "disabled = %s, "
            params.append(disabled)

        # Remove trailing comma and add WHERE clause
        query = query.rstrip(', ') + " WHERE member_id = %s"
        params.append(member_id)

        cursor.execute(query, params)
        connection.commit()
        return get_user(member_id)
    except pymysql.MySQLError:
        return None
    finally:
        connection.close()


def delete_user(member_id: str):
    connection = connect_to_db()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM users WHERE member_id = %s", (member_id,))
    connection.commit()
    connection.close()


def authenticate_user(member_id: str, password: str) -> Union[UserInDB, None]:
    user = get_user(member_id)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user
