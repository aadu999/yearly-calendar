/**
 * Debug endpoint to check font availability
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = async (req, res) => {
    const debug = {
        environment: {
            VERCEL: process.env.VERCEL,
            NODE_ENV: process.env.NODE_ENV,
            FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
            FONTCONFIG_PATH: process.env.FONTCONFIG_PATH
        },
        bundledFonts: [],
        tmpFonts: [],
        fcList: null,
        sharp: null
    };

    try {
        // Check bundled fonts
        const fontsDir = path.join(__dirname, '../fonts');
        if (fs.existsSync(fontsDir)) {
            debug.bundledFonts = fs.readdirSync(fontsDir);
        } else {
            debug.bundledFontsError = 'Fonts directory not found: ' + fontsDir;
        }

        // Check /tmp/fonts
        if (fs.existsSync('/tmp/fonts')) {
            debug.tmpFonts = fs.readdirSync('/tmp/fonts');
        } else {
            debug.tmpFontsError = '/tmp/fonts does not exist';
        }

        // Try fc-list
        try {
            const fcOutput = execSync('fc-list 2>&1', { encoding: 'utf8', timeout: 3000 });
            debug.fcList = fcOutput.substring(0, 1000);
        } catch (err) {
            debug.fcListError = err.message;
        }

        // Sharp info
        try {
            const sharp = require('sharp');
            debug.sharp = {
                version: sharp.versions,
                formats: sharp.format
            };
        } catch (err) {
            debug.sharpError = err.message;
        }

        res.json(debug);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack,
            debug
        });
    }
};
