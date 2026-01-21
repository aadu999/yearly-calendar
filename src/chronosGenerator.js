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

// Theme definitions - matching client-side themes exactly
const THEMES = {
    cyber: {
        name: 'Cyber',
        bg: '#050505',
        text: '#ffffff',
        accent: '#ccff00',
        secondary: '#262626',
        muted: '#111111'
    },
    swiss: {
        name: 'Swiss',
        bg: '#f0f0f0',
        text: '#111111',
        accent: '#ff3b30',
        secondary: '#d1d1d6',
        muted: '#e5e5ea'
    },
    deep: {
        name: 'Deep Space',
        bg: '#020617',
        text: '#f8fafc',
        accent: '#38bdf8',
        secondary: '#1e293b',
        muted: '#0f172a'
    },
    slate: {
        name: 'Monolith',
        bg: '#1c1917',
        text: '#e7e5e4',
        accent: '#ea580c',
        secondary: '#44403c',
        muted: '#292524'
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
                rx="${barHeight / 2}" fill="${this.colors.muted}"/>`;

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
                rx="${this.width * 0.01}" fill="${this.colors.muted}"/>`;

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
                rx="${barHeight / 2}" fill="${this.colors.muted}"/>`;

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
        const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const firstDayOfYear = new Date(this.currentYear, 0, 1);
        const firstDayIndex = firstDayOfYear.getDay(); // 0 = Sunday, 6 = Saturday
        const currentDayOfWeek = this.currentDate.getDay();

        let svg = '';

        // Calculate label size and adjust grid area
        const labelSize = isDesktop ? width * 0.03 : height * 0.04;
        let gridX = x;
        let gridY = y;
        let gridWidth = width;
        let gridHeight = height;

        if (isDesktop) {
            // Labels on the left
            gridX += labelSize;
            gridWidth -= labelSize;

            const rowHeight = gridHeight / 7;
            DAYS_HEADER.forEach((day, i) => {
                const color = (i === currentDayOfWeek) ? this.colors.accent : this.colors.secondary;
                const labelY = y + (i * rowHeight) + (rowHeight / 2);
                svg += `<text x="${x + labelSize / 2}" y="${labelY}"
                        text-anchor="middle" dominant-baseline="middle"
                        font-family="Arial, sans-serif" font-size="${labelSize * 0.5}" font-weight="bold"
                        fill="${color}">${day}</text>`;
            });
        } else {
            // Labels on top
            gridY += labelSize;
            gridHeight -= labelSize;

            const colWidth = gridWidth / 7;
            DAYS_HEADER.forEach((day, i) => {
                const color = (i === currentDayOfWeek) ? this.colors.accent : this.colors.secondary;
                const labelX = x + (i * colWidth) + (colWidth / 2);
                svg += `<text x="${labelX}" y="${y + labelSize / 2}"
                        text-anchor="middle" dominant-baseline="middle"
                        font-family="Arial, sans-serif" font-size="${labelSize * 0.5}" font-weight="bold"
                        fill="${color}">${day}</text>`;
            });
        }

        // Calculate grid cells
        const cols = isDesktop ? 53 : 7;
        const rows = isDesktop ? 7 : 53;
        const gap = Math.min(gridWidth, gridHeight) * 0.002;

        const cellWidth = (gridWidth - (gap * (cols - 1))) / cols;
        const cellHeight = (gridHeight - (gap * (rows - 1))) / rows;

        // Draw all 371 positions (53 weeks × 7 days)
        for (let i = 0; i < 371; i++) {
            let col, row;

            if (isDesktop) {
                // Desktop: vertical layout (columns = weeks, rows = days of week)
                row = i % 7;
                col = Math.floor(i / 7);
            } else {
                // Mobile: horizontal layout (columns = days of week, rows = weeks)
                col = i % 7;
                row = Math.floor(i / 7);
            }

            // Calculate day index with first day offset
            const dIndex = isDesktop
                ? (col * 7) + row - firstDayIndex
                : (row * 7) + col - firstDayIndex;

            // Skip if out of range
            if (dIndex < 0 || dIndex >= this.totalDays) {
                continue;
            }

            const dayNumber = dIndex + 1; // Convert 0-indexed to 1-indexed
            const cellX = gridX + (col * (cellWidth + gap));
            const cellY = gridY + (row * (cellHeight + gap));

            // Determine color based on day status
            let fill;
            const isPast = dayNumber < this.dayOfYear;
            const isToday = dayNumber === this.dayOfYear;

            if (isToday) {
                fill = this.colors.accent;
            } else if (isPast) {
                fill = this.colors.secondary;
            } else {
                fill = this.colors.muted;
            }

            // Generate shape
            if (this.shape === 'circle') {
                const radius = Math.min(cellWidth, cellHeight) / 2;
                svg += `<circle cx="${cellX + cellWidth / 2}" cy="${cellY + cellHeight / 2}" r="${radius}"
                        fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else if (this.shape === 'square') {
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}"
                        fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else { // rounded
                const radius = Math.min(cellWidth, cellHeight) * 0.3;
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}"
                        rx="${radius}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            }
        }

        return svg;
    }
}

module.exports = ChronosGenerator;
