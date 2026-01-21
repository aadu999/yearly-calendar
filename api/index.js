/**
 * API documentation endpoint for Vercel
 */
module.exports = (req, res) => {
  res.json({
    name: 'Yearly Calendar Generator API',
    version: '1.0.0',
    description: 'Generate minimalist yearly calendars in 4K resolution',
    platform: 'Vercel Serverless',
    endpoints: {
      '/calendar/generate': {
        method: 'GET',
        description: 'Generate and download a calendar image',
        parameters: {
          year: {
            type: 'integer',
            required: false,
            default: 'current year',
            description: 'Year for the calendar (1900-2100)'
          },
          device: {
            type: 'string',
            required: false,
            default: 'laptop',
            options: ['laptop', 'mobile'],
            description: 'Device type for layout optimization'
          },
          completed: {
            type: 'string',
            required: false,
            description: 'Comma-separated completed days (dates: YYYY-MM-DD or day numbers: 1-365)',
            examples: [
              '2024-01-01,2024-01-15,2024-02-20',
              '1,15,51,100,200'
            ]
          }
        },
        examples: [
          '/calendar/generate?year=2024&device=laptop',
          '/calendar/generate?year=2024&device=mobile&completed=2024-01-01,2024-01-15',
          '/calendar/generate?year=2025&device=laptop&completed=1,15,51,100'
        ]
      },
      '/health': {
        method: 'GET',
        description: 'Health check endpoint'
      }
    },
    resolutions: {
      laptop: '3840 x 2160 (4K landscape)',
      mobile: '2160 x 3840 (4K portrait)'
    },
    repository: 'https://github.com/aadu999/yearly-calendar',
    deployment: {
      platform: 'Vercel',
      note: 'Serverless functions with automatic scaling'
    }
  });
};
