/**
 * Quote Reader - Reads quotes from CSV file
 */

const fs = require('fs');
const path = require('path');

// Cache for parsed quotes
let quotesCache = null;

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function loadQuotes() {
    if (quotesCache) {
        return quotesCache;
    }

    try {
        const quotesPath = path.join(__dirname, '../quotes.csv');

        if (!fs.existsSync(quotesPath)) {
            console.warn('[Quote Reader] quotes.csv not found, using fallback quotes');
            return getFallbackQuotes();
        }

        const content = fs.readFileSync(quotesPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        // Skip header line
        const dataLines = lines.slice(1);

        const quotes = dataLines.map(line => {
            const [quote, author] = parseCSVLine(line);
            return {
                text: quote || '',
                author: author || 'Unknown'
            };
        }).filter(q => q.text);

        if (quotes.length === 0) {
            console.warn('[Quote Reader] No valid quotes found in CSV, using fallback');
            return getFallbackQuotes();
        }

        console.log(`[Quote Reader] Loaded ${quotes.length} quotes from CSV`);
        quotesCache = quotes;
        return quotes;

    } catch (error) {
        console.error('[Quote Reader] Error loading quotes:', error.message);
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
    loadQuotes,
    getDailyQuote,
    getFallbackQuotes
};
