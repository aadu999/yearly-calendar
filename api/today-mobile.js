/**
 * Vercel serverless function for /today-mobile endpoint
 * Generates today's wallpaper in mobile format
 */

const ChronosGenerator = require('../src/chronosGenerator');
const { initFonts } = require('../src/init-fonts');

module.exports = async (req, res) => {
    try {
        // Initialize fonts at request time
        initFonts();

        const theme = req.query.theme || 'cyber';
        const shape = req.query.shape || 'rounded';

        const generator = new ChronosGenerator({
            date: new Date(),
            device: 'mobile',
            theme,
            shape
        });

        const buffer = await generator.generate();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="chronos-today-mobile-${theme}.png"`);
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating today mobile wallpaper:', error);
        res.status(500).json({
            error: 'Failed to generate wallpaper',
            message: error.message,
            stack: error.stack
        });
    }
};
