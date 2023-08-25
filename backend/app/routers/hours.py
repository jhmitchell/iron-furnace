import pytz
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from ..internal.db import get_operating_hours

router = APIRouter()

# Define the EST timezone
est_timezone = pytz.timezone('US/Eastern')


def format_time(time_obj: datetime.time) -> str:
    """
    Formats a time string to the format like 9:00 AM or 5:00 PM.

    Args:
        time_obj (datetime.time): A time object.

    Returns:
        str: Formatted time string.
    """

    return time_obj.strftime('%I:%M %p').lstrip('0')


@router.get("/hours/status")
def get_status():
    """
    Retrieves the current status and operating hours of a service based on the current date and time.

    This endpoint takes into account holidays, current operating hours, and upcoming opening hours 
    to provide a clear status message.

    Returns:
        dict:
            A dictionary with two keys:
            - "status" (str): Indicates the current status, which can be either "OPEN" or "CLOSED".
            - "message" (str):
                Provides detailed information about the status. It may include:
                - "Open today from <time> to <time>" if open today.
                - "Open tomorrow from <time> to <time>" if open tomorrow.
                - "Open <day_of_week> from <time> to <time>" if the next open day is not
                -   today or tomorrow.
                - "Closed for <holiday_description>" if the next open day is a holiday.
                - "Closed until further notice" if no upcoming opening hours are available.
    """
    # Retrieve operating hours and holidays
    hours, holidays = get_operating_hours()

    # Get the current EST time and date
    current_date_est = datetime.now(est_timezone).date()
    current_time_est = datetime.now(est_timezone).time()
    current_day_index = current_date_est.weekday()
    days_of_week = ['Monday', 'Tuesday', 'Wednesday',
                    'Thursday', 'Friday', 'Saturday', 'Sunday']

    # Check if today is a holiday
    for holiday in holidays:
        if holiday['holiday_date'] == current_date_est:
            return {"status": "CLOSED", "message": f"Closed for {holiday['description']}"}

    # Check if the current day is in the operating hours
    for hour in hours:
        open_time_str, close_time_str = hour['open_time'], hour['close_time']

        if hour['day_of_week'] == days_of_week[current_day_index] and open_time_str <= current_time_est <= close_time_str:
            return {"status": "OPEN", "message": f"Open today from {format_time(open_time_str)} to {format_time(close_time_str)}"}

    # Find the next open day
    # This will probably have to be refactored
    for i in range(8):  # Loop through the next 7 days including today
        next_day_index = (current_day_index + i) % 7
        next_opening_day = days_of_week[next_day_index]
        next_date_est = current_date_est + timedelta(days=i)

        next_hours = [
            hour for hour in hours if hour['day_of_week'] == next_opening_day]

        if next_hours:
            next_open, next_close = next_hours[0]['open_time'], next_hours[0]['close_time']
            if i == 0:
                if current_time_est < next_open:
                    return {"status": "CLOSED", "message": f"Open today from {format_time(next_open)} to {format_time(next_close)}"}
            elif i == 1:
                # Check if holiday
                for holiday in holidays:
                    print(holiday['holiday_date'], next_date_est)
                    if holiday['holiday_date'] == next_date_est:
                        return {"status": "CLOSED", "message": f"Closed for {holiday['description']}"}
                return {"status": "CLOSED", "message": f"Open tomorrow from {format_time(next_open)} to {format_time(next_close)}"}
            else:
                # Check if holiday
                for holiday in holidays:
                    if holiday['holiday_date'] == next_date_est:
                        return {"status": "CLOSED", "message": f"Closed for {holiday['description']}"}
                return {"status": "CLOSED", "message": f"Open {next_opening_day} from {format_time(next_open)} to {format_time(next_close)}"}

    return {"status": "CLOSED", "message": "Closed until further notice"}
