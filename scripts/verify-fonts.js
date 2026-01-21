#!/usr/bin/env node

/**
 * Build-time font verification script
 * Runs during Vercel build to confirm fonts are bundled correctly
 */

const fs = require('fs');
const path = require('path');

console.log('');
console.log('='.repeat(60));
console.log('FONT VERIFICATION - Build Time');
console.log('='.repeat(60));

const fontsDir = path.join(__dirname, '../fonts');

console.log('Fonts directory:', fontsDir);
console.log('');

if (!fs.existsSync(fontsDir)) {
    console.error('❌ ERROR: Fonts directory does not exist!');
    console.error('   Expected at:', fontsDir);
    process.exit(1);
}

console.log('✓ Fonts directory exists');

const files = fs.readdirSync(fontsDir);
console.log('');
console.log('Font files found:', files.length);
console.log('');

let ttfCount = 0;
files.forEach(file => {
    const filePath = path.join(fontsDir, file);
    const stats = fs.statSync(filePath);
    const isTTF = file.endsWith('.ttf');

    if (isTTF) ttfCount++;

    const icon = isTTF ? '✓' : '•';
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`  ${icon} ${file.padEnd(40)} ${sizeKB.padStart(10)} KB`);
});

console.log('');
console.log('─'.repeat(60));
console.log(`Total TTF fonts: ${ttfCount}`);
console.log('─'.repeat(60));

if (ttfCount === 0) {
    console.error('');
    console.error('❌ ERROR: No TTF font files found!');
    console.error('   At least one TTF file is required for the application to work.');
    process.exit(1);
}

// Check for expected fonts
const expectedFonts = [
    'LiberationSans-Regular.ttf',
    'LiberationSans-Bold.ttf',
    'LiberationSerif-Italic.ttf'
];

console.log('');
console.log('Expected fonts check:');
expectedFonts.forEach(font => {
    const exists = files.includes(font);
    const icon = exists ? '✓' : '✗';
    console.log(`  ${icon} ${font}`);
});

const allExpectedPresent = expectedFonts.every(font => files.includes(font));

console.log('');
if (allExpectedPresent) {
    console.log('✓ All expected fonts are present');
} else {
    console.log('⚠ WARNING: Some expected fonts are missing');
}

console.log('');
console.log('='.repeat(60));
console.log('Font verification complete');
console.log('='.repeat(60));
console.log('');

process.exit(0);
