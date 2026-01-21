#!/usr/bin/env node

/**
 * Download Google Fonts at build time
 * This ensures we have fonts available even if system fonts aren't accessible
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS = [
    {
        name: 'Inter-Regular',
        url: 'https://github.com/rsms/inter/raw/master/fonts/ttf/Inter-Regular.ttf'
    },
    {
        name: 'Inter-Bold',
        url: 'https://github.com/rsms/inter/raw/master/fonts/ttf/Inter-Bold.ttf'
    },
    {
        name: 'Inter-Italic',
        url: 'https://github.com/rsms/inter/raw/master/fonts/ttf/Inter-Italic.ttf'
    }
];

const fontsDir = path.join(__dirname, '../fonts-downloaded');

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

function downloadFont(fontInfo) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(fontsDir, `${fontInfo.name}.ttf`);

        // Skip if already exists
        if (fs.existsSync(filePath)) {
            console.log(`✓ ${fontInfo.name} already downloaded`);
            resolve();
            return;
        }

        console.log(`Downloading ${fontInfo.name}...`);

        const file = fs.createWriteStream(filePath);

        https.get(fontInfo.url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                https.get(response.headers.location, (redirectResponse) => {
                    redirectResponse.pipe(file);

                    file.on('finish', () => {
                        file.close();
                        console.log(`✓ Downloaded ${fontInfo.name}`);
                        resolve();
                    });
                }).on('error', reject);
            } else {
                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded ${fontInfo.name}`);
                    resolve();
                });
            }
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

async function downloadAll() {
    console.log('');
    console.log('='.repeat(60));
    console.log('DOWNLOADING FONTS');
    console.log('='.repeat(60));
    console.log('');

    for (const font of FONTS) {
        try {
            await downloadFont(font);
        } catch (err) {
            console.error(`✗ Failed to download ${font.name}:`, err.message);
        }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('Font download complete');
    console.log('='.repeat(60));
    console.log('');
}

downloadAll().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
