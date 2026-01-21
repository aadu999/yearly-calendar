# 📅 Yearly Calendar Generator

A minimalist yearly calendar generator API that creates beautiful 4K resolution PNG images. Perfect for laptop and mobile applications to track available and completed days throughout the year.

## ✨ Features

- 🎨 **Minimalist Design**: Clean, simple, and elegant calendar layout
- 📱 **Device Optimized**: Separate layouts for laptop (landscape) and mobile (portrait)
- 🖼️ **4K Resolution**: High-quality images (3840x2160 for laptop, 2160x3840 for mobile)
- ✅ **Day Status Tracking**: Visual distinction between available and completed days
- 🚀 **Simple API**: Easy-to-use REST endpoint for calendar generation
- 📅 **Flexible Input**: Support for date strings and day numbers

## 🎯 Design Philosophy

- **Available Days**: Light gray circles with outlined borders
- **Completed Days**: Filled blue circles with white text
- **Layout**:
  - Laptop: 4 columns × 3 rows (landscape)
  - Mobile: 2 columns × 6 rows (portrait)

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Start Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

This will generate sample calendars in the `test-output/` directory.

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Generate Calendar

**GET** `/calendar/generate`

Generate and download a yearly calendar image in 4K resolution.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Year for the calendar (1900-2100) |
| `device` | string | No | `laptop` | Device type: `laptop` or `mobile` |
| `completed` | string | No | - | Comma-separated completed days |

**Completed Days Format:**

You can specify completed days in two formats:

1. **Date strings** (YYYY-MM-DD):
   ```
   2024-01-01,2024-01-15,2024-02-20
   ```

2. **Day numbers** (1-365 or 1-366 for leap years):
   ```
   1,15,51,100,200
   ```

**Response:**
- Content-Type: `image/png`
- Resolution: 3840×2160 (laptop) or 2160×3840 (mobile)

**Examples:**

```bash
# Basic laptop calendar for current year
curl "http://localhost:3000/calendar/generate" -o calendar.png

# Mobile calendar for 2024
curl "http://localhost:3000/calendar/generate?year=2024&device=mobile" -o calendar.png

# Laptop calendar with completed days (date format)
curl "http://localhost:3000/calendar/generate?year=2024&device=laptop&completed=2024-01-01,2024-01-15,2024-02-14" -o calendar.png

# Mobile calendar with completed days (day numbers)
curl "http://localhost:3000/calendar/generate?year=2024&device=mobile&completed=1,15,30,45,60" -o calendar.png
```

#### 2. API Info

**GET** `/`

Returns API documentation and available endpoints.

#### 3. Health Check

**GET** `/health`

Returns server health status.

## 🎨 Visual Design

### Color Scheme

```javascript
{
  background: '#FFFFFF',        // White background
  text: '#2C3E50',             // Dark gray text
  availableDay: '#E8E8E8',     // Light gray fill for available days
  availableDayStroke: '#CCCCCC', // Gray border for available days
  completedDay: '#3498DB',     // Blue fill for completed days
  monthLabel: '#2C3E50',       // Month name color
  dayLabel: '#7F8C8D',         // Day abbreviation color
}
```

### Layout Specifications

**Laptop (3840 × 2160)**
- Grid: 4 columns × 3 rows
- Orientation: Landscape
- Ideal for: Desktop wallpapers, laptop backgrounds

**Mobile (2160 × 3840)**
- Grid: 2 columns × 6 rows
- Orientation: Portrait
- Ideal for: Phone wallpapers, mobile apps

## 🏗️ Project Structure

```
yearly-calendar/
├── src/
│   ├── server.js              # Express server and API endpoints
│   ├── calendarGenerator.js   # Calendar generation logic
│   └── test.js                # Test script
├── test-output/               # Generated test images
├── package.json
├── .gitignore
└── README.md
```

## 🔧 Technical Details

### Dependencies

- **express**: Web server framework (v4.18.2)
- **sharp**: High-performance image processing library (v0.33.2)

### Image Generation

The calendar is generated using SVG (Scalable Vector Graphics) and converted to PNG via the `sharp` library:
- SVG provides precise vector graphics rendering
- Sharp converts SVG to high-quality PNG
- No native dependencies required (pure JavaScript)
- Efficient performance for 4K images
- Portable across all platforms

### Date Calculations

- Supports leap years (366 days)
- Accurate day-of-week calculations
- Handles all edge cases for month boundaries

## 🧪 Testing

Run the test suite to generate sample calendars:

```bash
npm test
```

This will create:
- Laptop calendar (empty)
- Mobile calendar (empty)
- Laptop calendar with completed days
- Mobile calendar with completed days
- Leap year calendar (2024)
- Non-leap year calendar (2025)

All test images are saved in `test-output/` directory.

## 🌐 Integration Examples

### JavaScript/Fetch

```javascript
// Download laptop calendar
fetch('http://localhost:3000/calendar/generate?year=2024&device=laptop')
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar-2024.png';
    a.click();
  });
```

### Python

```python
import requests

# Download calendar
response = requests.get(
    'http://localhost:3000/calendar/generate',
    params={'year': 2024, 'device': 'mobile', 'completed': '1,15,30'}
)

with open('calendar.png', 'wb') as f:
    f.write(response.content)
```

### cURL

```bash
# Download and save
curl "http://localhost:3000/calendar/generate?year=2024&device=laptop" \
  -o calendar-2024.png
```

## 🎯 Use Cases

- **Habit Tracking Apps**: Visualize daily progress
- **Productivity Tools**: Show completed tasks by day
- **Fitness Applications**: Track workout days
- **Learning Platforms**: Display study streaks
- **Project Management**: Visualize project timelines
- **Personal Goal Tracking**: Monitor daily achievements

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

MIT License - Feel free to use this in your projects!

## 🚀 Future Enhancements

Potential features for future versions:
- Custom color schemes
- Multiple status types (not just available/completed)
- Text labels on specific days
- Holiday markers
- Week numbers
- Different calendar formats (ISO week, etc.)
- SVG output option
- PDF export
- Custom fonts

## 🚀 Deployment

This application is ready for deployment on multiple free platforms:

### One-Click Deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aadu999/yearly-calendar)

### Quick Deploy Options:

**Vercel (Recommended - Serverless):**
```bash
npm install -g vercel
vercel
```

**Railway (Traditional Server):**
- Connect GitHub repo at [railway.app](https://railway.app)
- Auto-deploys on push

**Render:**
- Create Web Service at [render.com](https://render.com)
- Build: `npm install`, Start: `npm start`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and platform comparisons.

### Deployment Features:
- ✅ Vercel serverless functions configured (`/api` directory)
- ✅ Traditional Express server (`npm start`)
- ✅ Works on Netlify, Railway, Render, Fly.io
- ✅ No configuration needed for most platforms
- ✅ Automatic HTTPS and CDN on all platforms

## 💡 Tips

1. **Performance**: Generating 4K images takes ~1-2 seconds. Consider caching frequently requested calendars.

2. **Memory**: Each 4K PNG is approximately 500KB-1MB in size.

3. **Completed Days**: For better performance with many completed days, consider using day numbers instead of date strings.

4. **Integration**: The API is stateless, making it perfect for serverless deployments.

5. **Deployment**: Use Vercel for best performance, Railway for always-on server.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

Made with ❤️ for tracking progress and building better habits
