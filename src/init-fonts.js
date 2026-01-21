/**
 * Font initialization for Vercel serverless environment
 * Copies bundled fonts to a temporary location where librsvg can find them
 */

const fs = require('fs');
const path = require('path');

function initFonts() {
    try {
        // Check if running in Vercel or serverless environment
        const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

        if (isServerless) {
            console.log('Serverless environment detected, setting up fonts...');

            // Set fontconfig path to use bundled fonts
            const fontsDir = path.join(__dirname, '../fonts');

            // Create fontconfig in /tmp
            const tmpFontsDir = '/tmp/fonts';
            if (!fs.existsSync(tmpFontsDir)) {
                fs.mkdirSync(tmpFontsDir, { recursive: true });
            }

            // Copy fonts to /tmp
            const fontFiles = fs.readdirSync(fontsDir);
            for (const fontFile of fontFiles) {
                const src = path.join(fontsDir, fontFile);
                const dest = path.join(tmpFontsDir, fontFile);
                if (!fs.existsSync(dest)) {
                    fs.copyFileSync(src, dest);
                    console.log(`Copied font: ${fontFile}`);
                }
            }

            // Create fontconfig file
            const fontconfigPath = '/tmp/fonts.conf';
            const fontconfigContent = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/tmp/fonts</dir>
  <cachedir>/tmp/fontconfig-cache</cachedir>
</fontconfig>`;

            fs.writeFileSync(fontconfigPath, fontconfigContent);

            // Set environment variable for fontconfig
            process.env.FONTCONFIG_FILE = fontconfigPath;
            process.env.FONTCONFIG_PATH = '/tmp';

            console.log('Fonts initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing fonts:', error.message);
        // Continue anyway - fonts might be available system-wide
    }
}

module.exports = { initFonts };
