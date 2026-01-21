const sharp = require('sharp');

// Quote Database
const QUOTES = [
    "Focus on being productive instead of busy.",
    "The future depends on what you do today.",
    "Small daily improvements lead to stunning results.",
    "Progress, not perfection.",
    "Make each day your masterpiece.",
    "The only way to do great work is to love what you do.",
    "Dream big. Start small. Act now.",
    "Consistency is the key to excellence.",
    "Every expert was once a beginner.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream it. Wish it. Do it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't wait for opportunity. Create it.",
    "The key to success is to focus on goals, not obstacles.",
    "Believe you can and you're halfway there.",
    "Act as if what you do makes a difference. It does.",
    "Success is what comes after you stop making excuses.",
    "When you feel like quitting, think about why you started."
];

// Theme definitions
const THEMES = {
    cyber: {
        bg: '#050505',
        accent: '#ccff00',
        text: '#ffffff',
        muted: '#333333',
        dim: '#1a1a1a'
    },
    space: {
        bg: '#020617',
        accent: '#38bdf8',
        text: '#f0f9ff',
        muted: '#1e3a5f',
        dim: '#0f172a'
    },
    swiss: {
        bg: '#f0f0f0',
        accent: '#ff3b30',
        text: '#050505',
        muted: '#cccccc',
        dim: '#e0e0e0'
    }
};

/**
 * Chronos 4K Generator - Matrix Grid Year Progress Visualization
 */
class ChronosGenerator {
    constructor(options = {}) {
        const now = options.date || new Date();

        this.currentDate = now;
        this.currentYear = now.getFullYear();
        this.dayOfYear = this.getDayOfYear(now);
        this.totalDays = this.isLeapYear(this.currentYear) ? 366 : 365;

        this.theme = options.theme || 'cyber';
        this.shape = options.shape || 'rounded';
        this.layout = options.device || 'desktop';

        // Get theme colors
        this.colors = THEMES[this.theme] || THEMES.cyber;

        // Get dimensions
        if (this.layout === 'mobile') {
            this.width = 2160;
            this.height = 3840;
        } else {
            this.width = 3840;
            this.height = 2160;
        }

        this.monthNames = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];
    }

    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    async generate() {
        const svg = this.layout === 'mobile'
            ? this.generateMobileSVG()
            : this.generateDesktopSVG();

        const buffer = await sharp(Buffer.from(svg))
            .png()
            .toBuffer();

        return buffer;
    }

    generateDesktopSVG() {
        const padding = this.width * 0.03;
        const gap = this.width * 0.02;
        const sidebarWidth = this.width * 0.28;

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Background
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        // Date Display
        svg += `<text x="${padding}" y="${padding + this.width * 0.11}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.12}" font-weight="900"
                fill="${this.colors.text}">${this.currentDate.getDate()}</text>`;

        svg += `<text x="${padding}" y="${padding + this.width * 0.14}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.025}" font-weight="700"
                fill="${this.colors.accent}">${this.monthNames[this.currentDate.getMonth()]}</text>`;

        svg += `<text x="${padding}" y="${padding + this.width * 0.165}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.018}" font-weight="300"
                fill="${this.colors.muted}">${this.currentYear}</text>`;

        // Progress Bar
        const progressY = padding + this.width * 0.22;
        const barHeight = this.height * 0.012;
        const barWidth = sidebarWidth;
        const progressPercent = this.dayOfYear / this.totalDays;

        // Progress background
        svg += `<rect x="${padding}" y="${progressY}" width="${barWidth}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.dim}"/>`;

        // Progress fill with glow
        svg += `<defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>`;

        svg += `<rect x="${padding}" y="${progressY}" width="${barWidth * progressPercent}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.accent}" filter="url(#glow)"/>`;

        // Stats
        const statsY = progressY + barHeight + this.height * 0.04;
        svg += `<text x="${padding}" y="${statsY}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.05}" font-weight="900"
                fill="${this.colors.text}">${this.dayOfYear}</text>`;

        svg += `<text x="${padding}" y="${statsY + this.height * 0.03}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.01}" font-weight="600"
                fill="${this.colors.muted}">FINISHED</text>`;

        svg += `<text x="${padding + sidebarWidth * 0.55}" y="${statsY}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.05}" font-weight="900"
                fill="${this.colors.text}">${this.totalDays - this.dayOfYear}</text>`;

        svg += `<text x="${padding + sidebarWidth * 0.55}" y="${statsY + this.height * 0.03}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.01}" font-weight="600"
                fill="${this.colors.muted}">REMAINING</text>`;

        // Quote Card
        const quoteY = this.height - padding - this.height * 0.25;
        const quoteHeight = this.height * 0.2;

        svg += `<rect x="${padding}" y="${quoteY}" width="${sidebarWidth}" height="${quoteHeight}"
                rx="${this.width * 0.01}" fill="${this.colors.dim}"/>`;

        svg += `<rect x="${padding}" y="${quoteY}" width="4" height="${quoteHeight}"
                fill="${this.colors.accent}"/>`;

        // Quote mark
        svg += `<text x="${padding + this.width * 0.015}" y="${quoteY + this.height * 0.1}"
                font-family="Georgia, serif" font-size="${this.width * 0.12}" font-style="italic" font-weight="900"
                fill="${this.colors.muted}" opacity="0.15">"</text>`;

        // Quote text (wrapped)
        const quoteIndex = this.dayOfYear % QUOTES.length;
        const quoteText = QUOTES[quoteIndex];
        const words = quoteText.split(' ');
        let line = '';
        let lines = [];
        const maxWidth = sidebarWidth - this.width * 0.04;
        const charWidth = this.width * 0.013 * 0.55; // Approximate

        for (let word of words) {
            const testLine = line + word + ' ';
            if (testLine.length * charWidth > maxWidth && line.length > 0) {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        if (line.length > 0) lines.push(line.trim());

        lines.forEach((l, i) => {
            svg += `<text x="${padding + this.width * 0.02}" y="${quoteY + this.height * 0.08 + i * this.width * 0.02}"
                    font-family="Arial, sans-serif" font-size="${this.width * 0.013}" font-weight="300" font-style="italic"
                    fill="${this.colors.text}">${l}</text>`;
        });

        // Matrix Grid
        const matrixX = sidebarWidth + gap + padding;
        const matrixWidth = this.width - matrixX - padding;
        const matrixHeight = this.height - (padding * 2);

        svg += this.generateMatrixSVG(matrixX, padding, matrixWidth, matrixHeight, true);

        svg += '</svg>';
        return svg;
    }

    generateMobileSVG() {
        const padding = this.width * 0.03;
        const gap = this.width * 0.02;
        const headerHeight = this.height * 0.22;

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Background
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        // Date Display
        svg += `<text x="${padding}" y="${padding + this.width * 0.16}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.18}" font-weight="900"
                fill="${this.colors.text}">${this.currentDate.getDate()}</text>`;

        svg += `<text x="${padding}" y="${padding + this.width * 0.22}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.05}" font-weight="700"
                fill="${this.colors.accent}">${this.monthNames[this.currentDate.getMonth()]}</text>`;

        svg += `<text x="${padding}" y="${padding + this.width * 0.26}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.035}" font-weight="300"
                fill="${this.colors.muted}">${this.currentYear}</text>`;

        // Progress Bar
        const progressY = padding + this.width * 0.32;
        const barHeight = this.height * 0.008;
        const barWidth = this.width - (padding * 2);
        const progressPercent = this.dayOfYear / this.totalDays;

        svg += `<defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>`;

        svg += `<rect x="${padding}" y="${progressY}" width="${barWidth}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.dim}"/>`;

        svg += `<rect x="${padding}" y="${progressY}" width="${barWidth * progressPercent}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.accent}" filter="url(#glow)"/>`;

        // Stats
        const statsY = progressY + barHeight + this.height * 0.025;
        svg += `<text x="${padding}" y="${statsY}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.11}" font-weight="900"
                fill="${this.colors.text}">${this.dayOfYear}</text>`;

        svg += `<text x="${padding}" y="${statsY + this.height * 0.02}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.028}" font-weight="600"
                fill="${this.colors.muted}">FINISHED</text>`;

        // Right-aligned remaining
        const remainingText = (this.totalDays - this.dayOfYear).toString();
        const remainingWidth = remainingText.length * this.width * 0.11 * 0.6;

        svg += `<text x="${this.width - padding - remainingWidth}" y="${statsY}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.11}" font-weight="900"
                fill="${this.colors.text}">${remainingText}</text>`;

        svg += `<text x="${this.width - padding - this.width * 0.28}" y="${statsY + this.height * 0.02}"
                font-family="Arial, sans-serif" font-size="${this.width * 0.028}" font-weight="600"
                fill="${this.colors.muted}">REMAINING</text>`;

        // Matrix Grid
        const matrixY = headerHeight + gap;
        const matrixHeight = this.height - matrixY - padding;

        svg += this.generateMatrixSVG(padding, matrixY, this.width - (padding * 2), matrixHeight, false);

        svg += '</svg>';
        return svg;
    }

    generateMatrixSVG(x, y, width, height, isDesktop) {
        const cols = isDesktop ? 53 : 7;
        const rows = isDesktop ? 7 : 53;
        const gap = Math.min(width, height) * 0.003;

        const cellWidth = (width - (gap * (cols - 1))) / cols;
        const cellHeight = (height - (gap * (rows - 1))) / rows;

        let svg = '';

        for (let day = 1; day <= this.totalDays; day++) {
            let col, row;

            if (isDesktop) {
                col = Math.floor((day - 1) / 7);
                row = (day - 1) % 7;
            } else {
                col = (day - 1) % 7;
                row = Math.floor((day - 1) / 7);
            }

            const cellX = x + (col * (cellWidth + gap));
            const cellY = y + (row * (cellHeight + gap));

            // Determine color and opacity
            let fill, opacity = 1, addGlow = false;

            if (day < this.dayOfYear) {
                fill = this.colors.muted;
            } else if (day === this.dayOfYear) {
                fill = this.colors.accent;
                addGlow = true;
            } else {
                fill = this.colors.dim;
                opacity = 0.3;
            }

            // Generate shape
            if (this.shape === 'circle') {
                const radius = Math.min(cellWidth, cellHeight) / 2;
                svg += `<circle cx="${cellX + cellWidth / 2}" cy="${cellY + cellHeight / 2}" r="${radius}"
                        fill="${fill}" opacity="${opacity}"${addGlow ? ' filter="url(#glow)"' : ''}/>`;
            } else if (this.shape === 'square') {
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}"
                        fill="${fill}" opacity="${opacity}"${addGlow ? ' filter="url(#glow)"' : ''}/>`;
            } else { // rounded
                const radius = Math.min(cellWidth, cellHeight) * 0.2;
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}"
                        rx="${radius}" fill="${fill}" opacity="${opacity}"${addGlow ? ' filter="url(#glow)"' : ''}/>`;
            }
        }

        return svg;
    }
}

module.exports = ChronosGenerator;
