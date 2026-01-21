# 📚 Integration Examples

This directory contains example code for integrating with the Yearly Calendar Generator API.

## 📄 Files

### 1. test-api.html
Interactive web interface for testing the API in your browser.

**Usage:**
1. Start the server: `npm start`
2. Open `test-api.html` in your browser
3. Configure parameters and generate calendars
4. Preview and download images

**Features:**
- Visual parameter configuration
- Live preview
- Quick example templates
- Download functionality

### 2. client.js
Node.js client library with usage examples.

**Requirements:**
- Node.js installed

**Usage:**
```bash
# Make sure server is running
npm start

# In another terminal, run the examples
cd examples
node client.js
```

**Features:**
- Simple API wrapper
- Error handling
- Health check
- Multiple examples

### 3. client.py
Python client library with usage examples.

**Requirements:**
- Python 3.x
- requests library: `pip install requests`

**Usage:**
```bash
# Make sure server is running
npm start

# In another terminal, run the examples
cd examples
python3 client.py
```

**Features:**
- Clean API wrapper
- Progress feedback
- Multiple output formats
- Example usage patterns

## 🔗 API Endpoints

### Generate Calendar
```
GET /calendar/generate
```

**Parameters:**
- `year` (optional): Year for calendar (default: current year)
- `device` (optional): 'laptop' or 'mobile' (default: 'laptop')
- `completed` (optional): Comma-separated completed days

**Examples:**
```bash
# Basic request
http://localhost:3000/calendar/generate?year=2024&device=laptop

# With completed days (dates)
http://localhost:3000/calendar/generate?year=2024&device=mobile&completed=2024-01-01,2024-01-15

# With completed days (day numbers)
http://localhost:3000/calendar/generate?year=2024&device=laptop&completed=1,15,30,45,60
```

## 🎯 Integration Patterns

### JavaScript/Fetch
```javascript
const response = await fetch(
  'http://localhost:3000/calendar/generate?year=2024&device=laptop'
);
const blob = await response.blob();
const url = URL.createObjectURL(blob);
```

### Python/Requests
```python
import requests

response = requests.get(
    'http://localhost:3000/calendar/generate',
    params={'year': 2024, 'device': 'mobile'}
)

with open('calendar.png', 'wb') as f:
    f.write(response.content)
```

### cURL
```bash
curl "http://localhost:3000/calendar/generate?year=2024&device=laptop" \
  -o calendar.png
```

### PHP
```php
<?php
$url = 'http://localhost:3000/calendar/generate?year=2024&device=laptop';
$image = file_get_contents($url);
file_put_contents('calendar.png', $image);
?>
```

### Ruby
```ruby
require 'open-uri'

url = 'http://localhost:3000/calendar/generate?year=2024&device=laptop'
File.open('calendar.png', 'wb') do |file|
  file.write(URI.open(url).read)
end
```

## 💡 Tips

1. **Caching**: For frequently requested calendars, consider caching the generated images
2. **Error Handling**: Always check HTTP status codes and handle errors appropriately
3. **Timeouts**: Set reasonable timeouts (4K image generation takes 1-2 seconds)
4. **Validation**: Validate parameters before making requests

## 🚀 Production Deployment

When deploying to production:

1. **Environment Variables**: Use environment variables for configuration
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Caching**: Use a CDN or caching layer for frequently requested calendars
5. **Monitoring**: Monitor server health and response times

## 📞 Support

For questions or issues, please open an issue on the repository.
