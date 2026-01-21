/**
 * Font embedder - Embeds TTF fonts as base64 data URIs in SVG
 * This bypasses fontconfig completely and ensures fonts work in serverless environments
 */

const fs = require('fs');
const path = require('path');

// Cache for encoded fonts to avoid re-encoding on every request
const fontCache = {};

function getFontBase64(fontFileName) {
    if (fontCache[fontFileName]) {
        return fontCache[fontFileName];
    }

    const fontPath = path.join(__dirname, '../fonts', fontFileName);

    if (!fs.existsSync(fontPath)) {
        console.error(`[Font Embedder] Font file not found: ${fontPath}`);
        return null;
    }

    const fontBuffer = fs.readFileSync(fontPath);
    const base64Font = fontBuffer.toString('base64');

    fontCache[fontFileName] = base64Font;
    console.log(`[Font Embedder] Encoded ${fontFileName} (${(base64Font.length / 1024).toFixed(2)} KB base64)`);

    return base64Font;
}

function generateFontFaceSVG() {
    const fonts = [
        {
            family: 'Liberation Sans',
            file: 'LiberationSans-Regular.ttf',
            weight: '400',
            style: 'normal'
        },
        {
            family: 'Liberation Sans',
            file: 'LiberationSans-Bold.ttf',
            weight: '700',
            style: 'normal'
        },
        {
            family: 'Liberation Sans',
            file: 'LiberationSans-Bold.ttf',
            weight: '900',
            style: 'normal'
        },
        {
            family: 'Liberation Serif',
            file: 'LiberationSerif-Italic.ttf',
            weight: '400',
            style: 'italic'
        }
    ];

    let fontFaces = '<defs><style type="text/css"><![CDATA[\n';

    for (const font of fonts) {
        const base64 = getFontBase64(font.file);

        if (!base64) {
            console.error(`[Font Embedder] Skipping ${font.family} ${font.weight} ${font.style} - file not found`);
            continue;
        }

        fontFaces += `
@font-face {
    font-family: '${font.family}';
    src: url('data:font/truetype;charset=utf-8;base64,${base64}') format('truetype');
    font-weight: ${font.weight};
    font-style: ${font.style};
}
`;
    }

    fontFaces += ']]></style>';

    return fontFaces;
}

module.exports = {
    generateFontFaceSVG,
    getFontBase64
};
