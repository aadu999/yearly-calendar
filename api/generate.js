const CalendarGenerator = require('../src/calendarGenerator');

/**
 * Parse completed days from query parameter
 */
function parseCompletedDays(completedParam) {
  if (!completedParam) return [];
  return completedParam.split(',').map(item => item.trim()).filter(item => item);
}

/**
 * Vercel serverless function for calendar generation
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    // Send the image
    res.send(buffer);

  } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(500).json({
      error: 'Failed to generate calendar',
      message: error.message
    });
  }
};
