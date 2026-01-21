/**
 * Vercel serverless function for /iphone-lock endpoint
 * Generates iPhone 15/16 Pro lock screen wallpaper
 */

const ChronosGenerator = require('../src/chronosGenerator');
const { initFonts } = require('../src/init-fonts');

module.exports = async (req, res) => {
    try {
        // Initialize fonts
        initFonts();
        const theme = req.query.theme || 'cyber';
        const shape = req.query.shape || 'circle';

        const generator = new ChronosGenerator({
            date: new Date(),
            device: 'iphone-lock',
            theme,
            shape
        });

        const buffer = await generator.generate();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
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
