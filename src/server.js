const express = require('express');
const path = require('path');
const ChronosGenerator = require('./chronosGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

/**
 * GET /
 * Serve the main Chronos UI
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * GET /api/generate
 *
 * Query parameters:
 * - year: Year for visualization (default: current year)
 * - device: 'desktop' or 'mobile' (default: 'desktop')
 * - theme: 'cyber', 'space', or 'swiss' (default: 'cyber')
 * - shape: 'circle', 'square', or 'rounded' (default: 'rounded')
 * - date: Specific date to highlight (YYYY-MM-DD, default: today)
 *
 * Returns: PNG image (4K resolution)
 */
app.get('/api/generate', async (req, res) => {
    try {
        // Parse query parameters
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const device = req.query.device || 'desktop';
        const theme = req.query.theme || 'cyber';
        const shape = req.query.shape || 'rounded';

        // Parse date if provided
        let date = new Date();
        if (req.query.date) {
            const parsedDate = new Date(req.query.date);
            if (!isNaN(parsedDate.getTime())) {
                date = parsedDate;
            }
        } else {
            // If no date provided, use today but with the specified year
            date = new Date(year, date.getMonth(), date.getDate());
        }

        // Validate parameters
        if (year < 1900 || year > 2100) {
            return res.status(400).json({
                error: 'Invalid year. Please provide a year between 1900 and 2100.'
            });
        }

        if (!['desktop', 'mobile'].includes(device)) {
            return res.status(400).json({
                error: 'Invalid device. Please use "desktop" or "mobile".'
            });
        }

        if (!['cyber', 'swiss', 'deep', 'slate'].includes(theme)) {
            return res.status(400).json({
                error: 'Invalid theme. Please use "cyber", "swiss", "deep", or "slate".'
            });
        }

        if (!['circle', 'square', 'rounded'].includes(shape)) {
            return res.status(400).json({
                error: 'Invalid shape. Please use "circle", "square", or "rounded".'
            });
        }

        // Generate wallpaper
        const generator = new ChronosGenerator({
            date,
            device,
            theme,
            shape
        });

        const buffer = await generator.generate();

        // Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="chronos-${year}-${device}-${theme}.png"`);
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        // Send the image
        res.send(buffer);

    } catch (error) {
        console.error('Error generating wallpaper:', error);
        res.status(500).json({
            error: 'Failed to generate wallpaper',
            message: error.message
        });
    }
});

/**
 * GET /today-laptop
 * Quick endpoint to generate today's wallpaper in desktop format
 * Optional query parameters: theme, shape
 */
app.get('/today-laptop', async (req, res) => {
    try {
        const theme = req.query.theme || 'cyber';
        const shape = req.query.shape || 'rounded';

        const generator = new ChronosGenerator({
            date: new Date(),
            device: 'desktop',
            theme,
            shape
        });

        const buffer = await generator.generate();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="chronos-today-desktop-${theme}.png"`);
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating today laptop wallpaper:', error);
        res.status(500).json({
            error: 'Failed to generate wallpaper',
            message: error.message
        });
    }
});

/**
 * GET /today-mobile
 * Quick endpoint to generate today's wallpaper in mobile format
 * Optional query parameters: theme, shape
 */
app.get('/today-mobile', async (req, res) => {
    try {
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
            message: error.message
        });
    }
});

/**
 * GET /api/info
 * API documentation endpoint
 */
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Chronos 4K - Year Progress Visualization API',
        version: '2.0.0',
        description: 'Generate minimalist Matrix grid year progress wallpapers in 4K resolution',
        endpoints: {
            '/': {
                method: 'GET',
                description: 'Interactive Chronos 4K dashboard'
            },
            '/today-laptop': {
                method: 'GET',
                description: 'Quick endpoint to generate today\'s wallpaper in desktop format (3840x2160)',
                parameters: {
                    theme: {
                        type: 'string',
                        required: false,
                        default: 'cyber',
                        options: ['cyber', 'swiss', 'deep', 'slate'],
                        description: 'Color theme'
                    },
                    shape: {
                        type: 'string',
                        required: false,
                        default: 'rounded',
                        options: ['circle', 'square', 'rounded'],
                        description: 'Grid cell shape'
                    }
                },
                examples: [
                    '/today-laptop',
                    '/today-laptop?theme=swiss',
                    '/today-laptop?theme=space&shape=circle'
                ]
            },
            '/today-mobile': {
                method: 'GET',
                description: 'Quick endpoint to generate today\'s wallpaper in mobile format (2160x3840)',
                parameters: {
                    theme: {
                        type: 'string',
                        required: false,
                        default: 'cyber',
                        options: ['cyber', 'swiss', 'deep', 'slate'],
                        description: 'Color theme'
                    },
                    shape: {
                        type: 'string',
                        required: false,
                        default: 'rounded',
                        options: ['circle', 'square', 'rounded'],
                        description: 'Grid cell shape'
                    }
                },
                examples: [
                    '/today-mobile',
                    '/today-mobile?theme=deep',
                    '/today-mobile?theme=swiss&shape=square'
                ]
            },
            '/api/generate': {
                method: 'GET',
                description: 'Generate and download a year progress wallpaper',
                parameters: {
                    year: {
                        type: 'integer',
                        required: false,
                        default: 'current year',
                        description: 'Year for visualization (1900-2100)'
                    },
                    device: {
                        type: 'string',
                        required: false,
                        default: 'desktop',
                        options: ['desktop', 'mobile'],
                        description: 'Device type for layout'
                    },
                    theme: {
                        type: 'string',
                        required: false,
                        default: 'cyber',
                        options: ['cyber', 'swiss', 'deep', 'slate'],
                        description: 'Color theme'
                    },
                    shape: {
                        type: 'string',
                        required: false,
                        default: 'rounded',
                        options: ['circle', 'square', 'rounded'],
                        description: 'Grid cell shape'
                    },
                    date: {
                        type: 'string',
                        required: false,
                        default: 'today',
                        description: 'Date to highlight (YYYY-MM-DD)',
                        example: '2024-06-15'
                    }
                },
                examples: [
                    '/api/generate?year=2024&device=desktop&theme=cyber',
                    '/api/generate?year=2024&device=mobile&theme=space&shape=circle',
                    '/api/generate?year=2024&device=desktop&theme=swiss&shape=square&date=2024-06-15'
                ]
            },
            '/health': {
                method: 'GET',
                description: 'Health check endpoint'
            }
        },
        themes: {
            cyber: 'Cyber - Neon Lime on Void Black',
            swiss: 'Swiss - International Red on Light Gray',
            deep: 'Deep Space - Sky Blue on Navy',
            slate: 'Monolith - Orange on Dark Brown'
        },
        shapes: {
            circle: 'Round cells',
            square: 'Sharp corners',
            rounded: 'Rounded rectangles'
        },
        resolutions: {
            desktop: '3840 x 2160 (4K landscape)',
            mobile: '2160 x 3840 (4K portrait)'
        }
    });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        name: 'Chronos 4K'
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🌌 Chronos 4K - Year Progress Visualization`);
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📖 Interactive UI: http://localhost:${PORT}/`);
        console.log(`🎨 API endpoint: http://localhost:${PORT}/api/generate`);
        console.log(`📚 API docs: http://localhost:${PORT}/api/info`);
    });
}

module.exports = app;
