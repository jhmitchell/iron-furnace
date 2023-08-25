from unittest.mock import patch
from datetime import datetime, time
import pytz
from app.routers.hours import get_status
import pytest

def common_test_setup(mock_time_str, holidays):
    # Actual operating hours
    operating_hours = [
        {'day_of_week': 'Friday', 'open_time': time(9, 0), 'close_time': time(16, 0)},
        {'day_of_week': 'Saturday', 'open_time': time(9, 0), 'close_time': time(16, 0)},
        {'day_of_week': 'Sunday', 'open_time': time(12, 0), 'close_time': time(16, 0)},
    ]

    # Mocking the get_operating_hours function
    def mock_get_operating_hours():
        return operating_hours, holidays

    # Set the EST timezone
    est_timezone = pytz.timezone('US/Eastern')

    # Mock the current time
    mock_time = datetime.strptime(mock_time_str, '%Y-%m-%d %H:%M:%S')
    mock_time = est_timezone.localize(mock_time)

    with patch('app.internal.db.get_operating_hours', mock_get_operating_hours):
        with patch('app.routers.hours.datetime') as mock_datetime:
            mock_datetime.now.return_value = mock_time
            mock_datetime.strptime = datetime.strptime
            return get_status()

@pytest.mark.parametrize("mock_time_str,holidays,expected_result", [
    # Test when it's a holiday
    ('2023-12-25 03:00:00', [{'holiday_date': '2023-12-25', 'description': 'Christmas'}], {"status": "CLOSED", "message": "Closed for Christmas"}),

    # Test when it's open now (Friday)
    ('2023-08-25 10:00:00', [], {"status": "OPEN", "message": "Open today from 9:00 AM to 4:00 PM"}),

    # Test when it's closed now, but will open later today
    # ... more cases here ...
])
def test_get_status(mock_time_str, holidays, expected_result):
    result = common_test_setup(mock_time_str, holidays)
    assert result == expected_result
