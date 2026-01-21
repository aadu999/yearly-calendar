const ChronosGenerator = require('../src/chronosGenerator');
const { getNowInTimezone } = require('../src/date-helper');

/**
 * Vercel Serverless Function for Chronos 4K Generation
 */
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {

        // Parse query parameters
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const device = req.query.device || 'desktop';
        const theme = req.query.theme || 'cyber';
        const shape = req.query.shape || 'rounded';

        // Parse date if provided
        let date;
        if (req.query.date) {
            const parsedDate = new Date(req.query.date);
            if (!isNaN(parsedDate.getTime())) {
                date = parsedDate;
            } else {
                date = getNowInTimezone(req);
            }
        } else {
            // Use timezone-aware "now"
            const now = getNowInTimezone(req);
            date = new Date(year, now.getMonth(), now.getDate());
        }

        // Validate parameters
        if (year < 1900 || year > 2100) {
            return res.status(400).json({
                error: 'Invalid year. Please provide a year between 1900 and 2100.'
            });
        }

        if (!['desktop', 'mobile'].includes(device)) {
            return res.status(400).json({
                error: 'Invalid device. Please use "desktop" or "mobile".'
            });
        }

        if (!['cyber', 'swiss', 'deep', 'slate'].includes(theme)) {
            return res.status(400).json({
                error: 'Invalid theme. Please use "cyber", "swiss", "deep", or "slate".'
            });
        }

        if (!['circle', 'square', 'rounded'].includes(shape)) {
            return res.status(400).json({
                error: 'Invalid shape. Please use "circle", "square", or "rounded".'
            });
        }

        // Generate wallpaper
        const generator = new ChronosGenerator({
            date,
            device,
            theme,
            shape
        });

        const buffer = await generator.generate();

        // Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="chronos-${year}-${device}-${theme}.png"`);
        // Reduced cache to 10 minutes to handle timezone transitions better
        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

        // Send the image
        res.send(buffer);

    } catch (error) {
        console.error('Error generating wallpaper:', error);
        res.status(500).json({
            error: 'Failed to generate wallpaper',
            message: error.message,
            stack: error.stack
        });
    }
};
