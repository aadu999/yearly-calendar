/**
 * Font initialization for Vercel serverless environment
 * Copies bundled fonts to a temporary location where librsvg can find them
 */

const fs = require('fs');
const path = require('path');

let fontsInitialized = false;

function initFonts() {
    // Check if fonts actually exist in /tmp, not just if we think we initialized them
    const tmpFontsDir = '/tmp/fonts';
    if (fontsInitialized && fs.existsSync(tmpFontsDir)) {
        const tmpFiles = fs.readdirSync(tmpFontsDir);
        if (tmpFiles.length > 0) {
            console.log('[Font Init] Already initialized, skipping');
            return;
        }
    }

    try {
        const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT;

        console.log('[Font Init] Environment:', {
            VERCEL: !!process.env.VERCEL,
            NODE_ENV: process.env.NODE_ENV,
            isServerless: !!isServerless
        });

        // Always try to set up fonts, even if not serverless
        const fontsDir = path.join(__dirname, '../fonts');

        if (!fs.existsSync(fontsDir)) {
            console.error('[Font Init] Fonts directory not found:', fontsDir);
            return;
        }

        const fontFiles = fs.readdirSync(fontsDir);
        console.log('[Font Init] Found font files:', fontFiles);

        if (fontFiles.length === 0) {
            console.warn('[Font Init] No font files found in fonts directory');
            return;
        }

        // Create /tmp/fonts directory
        console.log('[Font Init] Creating /tmp/fonts directory...');
        if (!fs.existsSync(tmpFontsDir)) {
            fs.mkdirSync(tmpFontsDir, { recursive: true });
            console.log('[Font Init] ✓ Created /tmp/fonts directory');
        } else {
            console.log('[Font Init] /tmp/fonts already exists');
        }

        // Copy fonts to /tmp
        let copiedCount = 0;
        console.log('[Font Init] Starting font copy...');
        for (const fontFile of fontFiles) {
            if (!fontFile.endsWith('.ttf')) {
                console.log('[Font Init] Skipping non-TTF file:', fontFile);
                continue;
            }

            const src = path.join(fontsDir, fontFile);
            const dest = path.join(tmpFontsDir, fontFile);

            try {
                // Check source exists
                if (!fs.existsSync(src)) {
                    console.error('[Font Init] Source file does not exist:', src);
                    continue;
                }

                fs.copyFileSync(src, dest);
                copiedCount++;

                // Verify the copy
                if (fs.existsSync(dest)) {
                    const stats = fs.statSync(dest);
                    console.log(`[Font Init] ✓ Copied ${fontFile} (${stats.size} bytes)`);
                } else {
                    console.error('[Font Init] Copy failed - destination does not exist:', dest);
                }
            } catch (err) {
                console.error('[Font Init] Failed to copy', fontFile, ':', err.message);
                console.error('[Font Init] Error stack:', err.stack);
            }
        }

        console.log(`[Font Init] ✓ Copied ${copiedCount} font files to /tmp/fonts`);

        // Create fontconfig directory
        const fontconfigDir = '/tmp/fontconfig';
        if (!fs.existsSync(fontconfigDir)) {
            fs.mkdirSync(fontconfigDir, { recursive: true });
        }

        // Create fontconfig XML file
        const fontconfigPath = path.join(fontconfigDir, 'fonts.conf');
        const fontconfigContent = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/tmp/fonts</dir>
  <cachedir>/tmp/fontconfig/cache</cachedir>
  <config>
    <rescan>
      <int>30</int>
    </rescan>
  </config>
</fontconfig>`;

        fs.writeFileSync(fontconfigPath, fontconfigContent);
        console.log('[Font Init] Created fontconfig at:', fontconfigPath);

        // Set environment variables
        process.env.FONTCONFIG_FILE = fontconfigPath;
        process.env.FONTCONFIG_PATH = fontconfigDir;
        process.env.FC_DEBUG = '1'; // Enable fontconfig debug logging

        console.log('[Font Init] Set FONTCONFIG_FILE to:', process.env.FONTCONFIG_FILE);
        console.log('[Font Init] Set FONTCONFIG_PATH to:', process.env.FONTCONFIG_PATH);

        // Verify fonts were copied
        console.log('[Font Init] Verifying fonts in /tmp/fonts...');
        if (fs.existsSync(tmpFontsDir)) {
            const tmpFontFiles = fs.readdirSync(tmpFontsDir);
            console.log('[Font Init] Fonts in /tmp/fonts:', tmpFontFiles);
            if (tmpFontFiles.length === 0) {
                console.error('[Font Init] WARNING: /tmp/fonts is empty!');
            }
        } else {
            console.error('[Font Init] ERROR: /tmp/fonts does not exist after initialization!');
        }

        // Try to list fonts to verify
        try {
            const { execSync } = require('child_process');
            const result = execSync('fc-list 2>&1 || echo "fc-list not available"', {
                encoding: 'utf8',
                timeout: 5000
            });
            console.log('[Font Init] fc-list output:', result.substring(0, 500));
        } catch (err) {
            console.log('[Font Init] Could not run fc-list:', err.message);
        }

        fontsInitialized = true;
        console.log('[Font Init] ✓ Font initialization complete');

    } catch (error) {
        console.error('[Font Init] ERROR:', error.message);
        console.error('[Font Init] Stack:', error.stack);
    }
}

module.exports = { initFonts };
