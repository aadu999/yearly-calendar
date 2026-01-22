/**
 * Groq AI Service - Dynamic Quote and Fact Generation
 * Provides inspirational quotes and interesting facts using Groq's LLM API
 */

const Groq = require('groq-sdk');

// Static fallback quotes (used when API is unavailable or not configured)
const FALLBACK_QUOTES = [
    "The future depends on what you do today.",
    "Time is the most valuable thing a man can spend.",
    "Action is the foundational key to all success.",
    "Don't count the days, make the days count.",
    "Your time is limited, so don't waste it.",
    "Focus on being productive instead of busy.",
    "Simplicity is the ultimate sophistication.",
    "Do it now. Sometimes 'later' becomes 'never'."
];

// Static fallback facts
const FALLBACK_FACTS = [
    "A year has exactly 31,536,000 seconds (or 31,622,400 in a leap year).",
    "The Earth travels around 940 million kilometers in its yearly orbit.",
    "Ancient Romans had a 10-month calendar before adding January and February.",
    "The Gregorian calendar we use today was introduced in 1582.",
    "A solar year is approximately 365.24219 days long.",
    "The concept of leap years was introduced by Julius Caesar in 45 BCE.",
    "Time zones were standardized in 1884 at the International Meridian Conference.",
    "The year 2000 was a leap year, but 1900 was not."
];

// Simple in-memory cache
const cache = {
    quotes: [],
    facts: [],
    lastUpdate: null,
    TTL: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

let groqClient = null;

/**
 * Initialize Groq client if API key is available
 */
function initGroqClient() {
    if (groqClient) return groqClient;
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        console.log('[Groq] API key not found. Using fallback quotes and facts.');
        return null;
    }
    
    try {
        groqClient = new Groq({ apiKey });
        console.log('[Groq] ✓ Client initialized successfully');
        return groqClient;
    } catch (error) {
        console.error('[Groq] Failed to initialize client:', error.message);
        return null;
    }
}

/**
 * Check if cache is valid
 */
function isCacheValid() {
    if (!cache.lastUpdate) return false;
    const now = Date.now();
    return (now - cache.lastUpdate) < cache.TTL;
}

/**
 * Generate a quote using Groq API
 */
async function generateQuote() {
    // Try to use cached quote first
    if (isCacheValid() && cache.quotes.length > 0) {
        const randomQuote = cache.quotes[Math.floor(Math.random() * cache.quotes.length)];
        console.log('[Groq] Using cached quote');
        return randomQuote;
    }
    
    // Initialize client
    const client = initGroqClient();
    
    // Use fallback if no client
    if (!client) {
        const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        console.log('[Groq] Using fallback quote');
        return randomQuote;
    }
    
    try {
        const completion = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a minimalist quote generator. Generate an inspirational quote from a well‑known or historically famous person. The quote should focus on themes such as time, progress, productivity, achievement, personal growth, or improving the energy and mindset of everyday life. Return only authentic, verifiable quotes—no fabrications. Keep the tone uplifting, motivating, and suitable for daily inspiration. Keep quotes under 120 characters for compact display. Return only the quote text no attribution or extra commentary.'
                },
                {
                    role: 'user',
                    content: 'Generate 5 unique inspirational quotes about making the most of time and tracking progress.'
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.9,
            max_tokens: 200
        });
        
        const response = completion.choices[0]?.message?.content || '';
        
        // Parse quotes from response (assuming they're separated by newlines)
        const quotes = response
            .split('\n')
            .map(q => q.trim())
            .map(q => q.replace(/^["']|["']$/g, '')) // Remove surrounding quotes
            .map(q => q.replace(/^\d+\.\s*/, '')) // Remove numbering
            .filter(q => q.length > 10 && q.length < 100); // Filter valid quotes
        
        if (quotes.length > 0) {
            // Update cache
            cache.quotes = quotes;
            cache.lastUpdate = Date.now();
            
            console.log(`[Groq] ✓ Generated ${quotes.length} new quotes`);
            return quotes[0]; // Return first quote
        }
        
        // Fallback if parsing failed
        throw new Error('No valid quotes parsed from response');
        
    } catch (error) {
        console.error('[Groq] Error generating quote:', error.message);
        const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        console.log('[Groq] Using fallback quote due to error');
        return randomQuote;
    }
}

/**
 * Generate a fact using Groq API
 */
async function generateFact() {
    // Try to use cached fact first
    if (isCacheValid() && cache.facts.length > 0) {
        const randomFact = cache.facts[Math.floor(Math.random() * cache.facts.length)];
        console.log('[Groq] Using cached fact');
        return randomFact;
    }
    
    // Initialize client
    const client = initGroqClient();
    
    // Use fallback if no client
    if (!client) {
        const randomFact = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
        console.log('[Groq] Using fallback fact');
        return randomFact;
    }
    
    try {
        const completion = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a minimalist fact generator. Generate short, interesting facts about time, calendars, years, or productivity. Keep facts under 80 characters for compact display. Return only the fact text, no extra commentary.'
                },
                {
                    role: 'user',
                    content: 'Generate 5 unique interesting facts about time, calendars, or the concept of a year.'
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            max_tokens: 250
        });
        
        const response = completion.choices[0]?.message?.content || '';
        
        // Parse facts from response
        const facts = response
            .split('\n')
            .map(f => f.trim())
            .map(f => f.replace(/^\d+\.\s*/, '')) // Remove numbering
            .filter(f => f.length > 15 && f.length < 150); // Filter valid facts
        
        if (facts.length > 0) {
            // Update cache
            cache.facts = facts;
            cache.lastUpdate = Date.now();
            
            console.log(`[Groq] ✓ Generated ${facts.length} new facts`);
            return facts[0]; // Return first fact
        }
        
        // Fallback if parsing failed
        throw new Error('No valid facts parsed from response');
        
    } catch (error) {
        console.error('[Groq] Error generating fact:', error.message);
        const randomFact = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
        console.log('[Groq] Using fallback fact due to error');
        return randomFact;
    }
}

/**
 * Get a quote or fact based on day of year
 * Even days: quote, Odd days: fact
 */
async function getDailyContent(dayOfYear) {
    const isEven = dayOfYear % 2 === 0;
    
    if (isEven) {
        return await generateQuote();
    } else {
        return await generateFact();
    }
}

module.exports = {
    generateQuote,
    generateFact,
    getDailyContent
};
