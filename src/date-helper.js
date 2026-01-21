/**
 * Get the current date/time adjusted to a specific timezone
 * 
 * @param {Object} req - Express request object
 * @returns {Date} - Date object where methods like getDate() return values for the target timezone
 */
function getNowInTimezone(req) {
    // 1. Explicit query parameter
    let timezone = req.query.timezone;

    // 2. Vercel IP Geolocation header
    if (!timezone && req.headers['x-vercel-ip-timezone']) {
        timezone = req.headers['x-vercel-ip-timezone'];
    }

    // Default to UTC if no timezone found
    if (!timezone) {
        return new Date();
    }

    try {
        // Create a date string for the target timezone
        const now = new Date();
        const timeString = now.toLocaleString('en-US', { timeZone: timezone });
        return new Date(timeString);
    } catch (e) {
        console.error(`Invalid timezone: ${timezone}, falling back to UTC`);
        return new Date();
    }
}

module.exports = { getNowInTimezone };
