/**
 * Debug endpoint to check SVG generation with embedded fonts
 */

const ChronosGenerator = require('../src/chronosGenerator');
const { initFonts } = require('../src/init-fonts');

module.exports = async (req, res) => {
    try {
        // Initialize fonts first
        initFonts();

        const generator = new ChronosGenerator({
            date: new Date(),
            device: 'desktop',
            theme: 'cyber',
            shape: 'rounded'
        });

        // Get the SVG directly instead of PNG
        const svg = generator.generateDesktopSVG();

        // Return debug info
        const svgLength = svg.length;
        const hasFontFace = svg.includes('@font-face');
        const hasBase64 = svg.includes('data:font/truetype');
        const fontFaceCount = (svg.match(/@font-face/g) || []).length;

        // Get a sample of the font embedding
        const fontFaceStart = svg.indexOf('@font-face');
        const fontSample = fontFaceStart >= 0
            ? svg.substring(fontFaceStart, fontFaceStart + 500)
            : 'Not found';

        res.json({
            svgLength,
            hasFontFace,
            hasBase64,
            fontFaceCount,
            fontSample,
            // Return first 2000 chars of SVG for inspection
            svgPreview: svg.substring(0, 2000)
        });

    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};
