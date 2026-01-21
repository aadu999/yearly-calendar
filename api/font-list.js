/**
 * Debug endpoint to list available system fonts
 */

const { execSync } = require('child_process');
const fs = require('fs');

module.exports = async (req, res) => {
    const debug = {
        fcList: null,
        fcListError: null,
        systemFontDirs: [],
        tmpFonts: []
    };

    // Try fc-list to see what fonts fontconfig can find
    try {
        const result = execSync('fc-list 2>&1', {
            encoding: 'utf8',
            timeout: 5000
        });
        debug.fcList = result.split('\n').slice(0, 50); // First 50 fonts
        debug.fcListCount = result.split('\n').length;
    } catch (err) {
        debug.fcListError = err.message;
    }

    // Check common system font directories
    const commonDirs = [
        '/usr/share/fonts',
        '/usr/local/share/fonts',
        '/var/task/fonts',
        '/tmp/fonts'
    ];

    for (const dir of commonDirs) {
        if (fs.existsSync(dir)) {
            try {
                const files = execSync(`find ${dir} -name "*.ttf" -o -name "*.otf" 2>/dev/null || echo ""`, {
                    encoding: 'utf8',
                    timeout: 3000
                }).trim().split('\n').filter(f => f);

                debug.systemFontDirs.push({
                    dir,
                    fonts: files.slice(0, 20) // First 20 files
                });
            } catch (err) {
                debug.systemFontDirs.push({
                    dir,
                    error: err.message
                });
            }
        }
    }

    res.json(debug);
};
