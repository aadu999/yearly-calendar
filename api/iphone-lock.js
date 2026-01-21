/**
 * Vercel serverless function for /iphone-lock endpoint
 * Generates iPhone 15/16 Pro lock screen wallpaper
 */

const ChronosGenerator = require('../src/chronosGenerator');
const { getNowInTimezone } = require('../src/date-helper');

module.exports = async (req, res) => {
    try {
        const theme = req.query.theme || 'cyber';
        const shape = req.query.shape || 'circle';

        // Use timezone-aware date
        const now = getNowInTimezone(req);

        const generator = new ChronosGenerator({
            date: now,
            device: 'iphone-lock',
            theme,
            shape
        });

        const buffer = await generator.generate();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline');
        // Reduced cache to 10 minutes
        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating iPhone lock screen wallpaper:', error);
        res.status(500).json({
            error: 'Failed to generate wallpaper',
            message: error.message,
            stack: error.stack
        });
    }
};
