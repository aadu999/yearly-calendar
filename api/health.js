/**
 * Health check endpoint
 */
module.exports = (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        name: 'Chronos 4K'
    });
};
