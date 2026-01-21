#!/usr/bin/env python3
"""
Python client example for the Yearly Calendar Generator API
Requires: requests library (pip install requests)
"""

import requests
import sys
from datetime import datetime

class CalendarClient:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url

    def generate_calendar(self, year=None, device='laptop', completed_days=None, output_file=None):
        """
        Generate a calendar image

        Args:
            year: Year for the calendar (default: current year)
            device: 'laptop' or 'mobile'
            completed_days: List of completed days (dates or day numbers)
            output_file: Path to save the image (default: calendar-YEAR-DEVICE.png)

        Returns:
            Path to the saved file
        """
        # Set defaults
        if year is None:
            year = datetime.now().year

        if output_file is None:
            output_file = f'calendar-{year}-{device}.png'

        # Build URL
        url = f'{self.base_url}/calendar/generate'
        params = {
            'year': year,
            'device': device
        }

        if completed_days:
            params['completed'] = ','.join(str(d) for d in completed_days)

        # Make request
        print(f'Generating calendar: {year} ({device})')
        if completed_days:
            print(f'Completed days: {len(completed_days)}')

        response = requests.get(url, params=params, stream=True)

        if response.status_code == 200:
            # Save image
            with open(output_file, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            print(f'✅ Calendar saved to: {output_file}')
            return output_file
        else:
            error = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            print(f'❌ Error: {error}')
            return None

    def check_health(self):
        """Check if the API is running"""
        try:
            response = requests.get(f'{self.base_url}/health')
            if response.status_code == 200:
                data = response.json()
                print(f'✅ API is healthy (timestamp: {data["timestamp"]})')
                return True
        except requests.exceptions.ConnectionError:
            print(f'❌ Cannot connect to API at {self.base_url}')
            return False

def main():
    """Example usage"""
    client = CalendarClient('http://localhost:3000')

    # Check if API is running
    if not client.check_health():
        print('\nMake sure the server is running:')
        print('  npm start')
        sys.exit(1)

    print('\n' + '='*50)
    print('Example 1: Basic laptop calendar')
    print('='*50)
    client.generate_calendar(
        year=2024,
        device='laptop',
        output_file='example1-laptop.png'
    )

    print('\n' + '='*50)
    print('Example 2: Mobile calendar with date strings')
    print('='*50)
    client.generate_calendar(
        year=2024,
        device='mobile',
        completed_days=[
            '2024-01-01', '2024-01-15', '2024-02-14',
            '2024-04-01', '2024-07-04', '2024-12-25'
        ],
        output_file='example2-mobile-dates.png'
    )

    print('\n' + '='*50)
    print('Example 3: Laptop calendar with day numbers')
    print('='*50)
    client.generate_calendar(
        year=2024,
        device='laptop',
        completed_days=[1, 15, 30, 45, 60, 75, 90, 100, 150, 200, 250, 300, 350],
        output_file='example3-laptop-numbers.png'
    )

    print('\n✅ All examples completed!')
    print('Check the current directory for the generated images.')

if __name__ == '__main__':
    main()
