/**
 * API documentation endpoint for Vercel
 */
module.exports = (req, res) => {
    res.json({
        name: 'Chronos 4K - Year Progress Visualization API',
        version: '2.0.0',
        description: 'Generate minimalist Matrix grid year progress wallpapers in 4K resolution',
        platform: 'Vercel Serverless',
        features: [
            'Matrix grid visualization of all 365/366 days',
            'Three stunning themes (Cyber, Space, Swiss)',
            'Three shape options (Circle, Square, Rounded)',
            'Perfect 4K resolution exports',
            'Desktop (16:9) and Mobile (9:16) layouts'
        ],
        endpoints: {
            '/': {
                method: 'GET',
                description: 'Interactive Chronos 4K dashboard'
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
                        description: 'Device type: desktop (16:9) or mobile (9:16)'
                    },
                    theme: {
                        type: 'string',
                        required: false,
                        default: 'cyber',
                        options: ['cyber', 'space', 'swiss'],
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
            cyber: {
                name: 'Cyber',
                description: 'Neon Lime on Void Black',
                colors: {
                    background: '#050505',
                    accent: '#ccff00',
                    text: '#ffffff'
                }
            },
            space: {
                name: 'Deep Space',
                description: 'Sky Blue on Navy',
                colors: {
                    background: '#020617',
                    accent: '#38bdf8',
                    text: '#f0f9ff'
                }
            },
            swiss: {
                name: 'Swiss',
                description: 'International Red on White',
                colors: {
                    background: '#f0f0f0',
                    accent: '#ff3b30',
                    text: '#050505'
                }
            }
        },
        shapes: {
            circle: 'Perfect circles for organic feel',
            square: 'Sharp corners for data-focused aesthetic',
            rounded: 'Rounded rectangles for modern UI'
        },
        resolutions: {
            desktop: '3840 x 2160 (4K landscape)',
            mobile: '2160 x 3840 (4K portrait)'
        },
        repository: 'https://github.com/aadu999/yearly-calendar',
        deployment: {
            platform: 'Vercel',
            note: 'Serverless functions with automatic scaling and global CDN'
        }
    });
};
