/**
 * CSV Quote Reader - Loads quotes with author attribution from CSV file
 */

const fs = require('fs');
const path = require('path');

// Cache for parsed quotes
let quotesCache = null;

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const quotes = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser that handles quoted fields
        const matches = line.match(/"([^"]*)","([^"]*)"/);
        if (matches) {
            quotes.push({
                text: matches[1],
                author: matches[2]
            });
        }
    }

    return quotes;
}

function loadQuotes() {
    if (quotesCache) {
        return quotesCache;
    }

    try {
        const csvPath = path.join(__dirname, '../quotes.csv');
        console.log('[Quote Reader] Loading quotes from:', csvPath);

        if (!fs.existsSync(csvPath)) {
            console.warn('[Quote Reader] CSV file not found, using fallback quotes');
            return getFallbackQuotes();
        }

        const content = fs.readFileSync(csvPath, 'utf-8');
        quotesCache = parseCSV(content);

        console.log(`[Quote Reader] ✓ Loaded ${quotesCache.length} quotes from CSV`);
        return quotesCache;

    } catch (error) {
        console.error('[Quote Reader] Error loading CSV:', error.message);
        return getFallbackQuotes();
    }
}

function getFallbackQuotes() {
    return [
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "Time is the most valuable thing a man can spend.", author: "Theophrastus" },
        { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
        { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
        { text: "Your time is limited, so don't waste it.", author: "Steve Jobs" },
        { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
        { text: "Do it now. Sometimes 'later' becomes 'never'.", author: "Unknown" }
    ];
}

function getDailyQuote(dayOfYear) {
    const quotes = loadQuotes();
    const index = dayOfYear % quotes.length;
    return quotes[index];
}

module.exports = {
    getDailyQuote,
    loadQuotes,
    getFallbackQuotes
};
