const express = require('express');
const CalendarGenerator = require('./calendarGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Parse completed days from query parameter
 * Accepts formats:
 * - Date strings: "2024-01-01,2024-01-15,2024-02-20"
 * - Day numbers: "1,15,51"
 */
function parseCompletedDays(completedParam) {
  if (!completedParam) return [];

  return completedParam.split(',').map(item => item.trim()).filter(item => item);
}

/**
 * GET /calendar/generate
 *
 * Query parameters:
 * - year: Year for the calendar (default: current year)
 * - device: 'laptop' or 'mobile' (default: 'laptop')
 * - completed: Comma-separated list of completed days
 *              Can be dates (YYYY-MM-DD) or day numbers (1-365/366)
 *              Example: "2024-01-01,2024-01-15" or "1,15,51"
 *
 * Returns: PNG image (4K resolution)
 */
app.get('/calendar/generate', async (req, res) => {
  try {
    // Parse query parameters
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const device = req.query.device || 'laptop';
    const completedDays = parseCompletedDays(req.query.completed);

    // Validate parameters
    if (year < 1900 || year > 2100) {
      return res.status(400).json({
        error: 'Invalid year. Please provide a year between 1900 and 2100.'
      });
    }

    if (device !== 'laptop' && device !== 'mobile') {
      return res.status(400).json({
        error: 'Invalid device. Please use "laptop" or "mobile".'
      });
    }

    // Generate calendar
    const generator = new CalendarGenerator(year, device, completedDays);
    const buffer = await generator.generate();

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="calendar-${year}-${device}.png"`);

    // Send the image
    res.send(buffer);

  } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(500).json({
      error: 'Failed to generate calendar',
      message: error.message
    });
  }
});

/**
 * GET /
 * API documentation endpoint
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Yearly Calendar Generator API',
    version: '1.0.0',
    description: 'Generate minimalist yearly calendars in 4K resolution',
    endpoints: {
      '/calendar/generate': {
        method: 'GET',
        description: 'Generate and download a calendar image',
        parameters: {
          year: {
            type: 'integer',
            required: false,
            default: 'current year',
            description: 'Year for the calendar (1900-2100)'
          },
          device: {
            type: 'string',
            required: false,
            default: 'laptop',
            options: ['laptop', 'mobile'],
            description: 'Device type for layout optimization'
          },
          completed: {
            type: 'string',
            required: false,
            description: 'Comma-separated completed days (dates: YYYY-MM-DD or day numbers: 1-365)',
            examples: [
              '2024-01-01,2024-01-15,2024-02-20',
              '1,15,51,100,200'
            ]
          }
        },
        examples: [
          '/calendar/generate?year=2024&device=laptop',
          '/calendar/generate?year=2024&device=mobile&completed=2024-01-01,2024-01-15',
          '/calendar/generate?year=2025&device=laptop&completed=1,15,51,100'
        ]
      }
    },
    resolutions: {
      laptop: '3840 x 2160 (4K landscape)',
      mobile: '2160 x 3840 (4K portrait)'
    }
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎨 Yearly Calendar Generator API`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API documentation: http://localhost:${PORT}/`);
  console.log(`🖼️  Generate calendar: http://localhost:${PORT}/calendar/generate?year=2024&device=laptop`);
});

module.exports = app;
