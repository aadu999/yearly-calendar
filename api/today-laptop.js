/**
 * Vercel serverless function for /today-laptop endpoint
 * Generates today's wallpaper in desktop format
 */

const ChronosGenerator = require('../src/chronosGenerator');

module.exports = async (req, res) => {
    try {
        const theme = req.query.theme || 'cyber';
        const shape = req.query.shape || 'rounded';

        const generator = new ChronosGenerator({
            date: new Date(),
            device: 'desktop',
            theme,
            shape
        });

        const buffer = await generator.generate();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="chronos-today-desktop-${theme}.png"`);
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating today laptop wallpaper:', error);
        res.status(500).json({
            error: 'Failed to generate wallpaper',
            message: error.message
        });
    }
};
