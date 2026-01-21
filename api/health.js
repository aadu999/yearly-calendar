/**
 * Health check endpoint for Vercel
 */
module.exports = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  });
};
