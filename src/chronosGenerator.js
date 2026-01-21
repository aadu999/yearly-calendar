const sharp = require('sharp');
const { initFonts } = require('./init-fonts');

// NOTE: librsvg in Vercel doesn't support @font-face with data URIs
// Using DejaVu fonts which are pre-installed in Vercel's environment
const FONT_SANS = 'DejaVu Sans, sans-serif';
const FONT_SERIF = 'DejaVu Serif, serif';

// Quote Database - must match client exactly
const QUOTES = [
  "The future depends on what you do today.",
  "Time is the most valuable thing a man can spend.",
  "Action is the foundational key to all success.",
  "Don't count the days, make the days count.",
  "Your time is limited, so don't waste it.",
  "Focus on being productive instead of busy.",
  "Simplicity is the ultimate sophistication.",
  "Do it now. Sometimes 'later' becomes 'never'."
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
 * Uses exact same zone-based layout as client-side for pixel-perfect matching
 */
class ChronosGenerator {
    constructor(options = {}) {
        const now = options.date || new Date();

        this.currentDate = now;
        this.currentYear = now.getFullYear();
        this.dayOfYear = this.getDayOfYear(now);
        this.totalDays = this.isLeapYear(this.currentYear) ? 366 : 365;
        this.remainingDays = this.totalDays - this.dayOfYear;
        this.progressPercent = this.dayOfYear / this.totalDays;

        this.theme = options.theme || 'cyber';
        this.shape = options.shape || 'rounded';
        this.layout = options.device || 'desktop';

        // Get theme colors
        this.colors = THEMES[this.theme] || THEMES.cyber;

        // Get dimensions
        if (this.layout === 'mobile') {
            this.width = 2160;
            this.height = 3840;
        } else if (this.layout === 'iphone-lock') {
            // iPhone 15/16 Pro Max resolution
            this.width = 1290;
            this.height = 2796;
        } else {
            this.width = 3840;
            this.height = 2160;
        }

        this.monthNames = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];

        this.quote = QUOTES[this.dayOfYear % QUOTES.length];
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

    // EXACT zone-based layout from client
    getLayoutZones(isMobile) {
        if (isMobile) {
            return {
                date: { left: 0.05, top: 0.05, width: 0.90, height: 0.22 },
                grid: { left: 0.05, top: 0.29, width: 0.90, height: 0.66 }
            };
        } else {
            return {
                date: { left: 0.05, top: 0.05, width: 0.30, height: 0.90 },
                grid: { left: 0.40, top: 0.05, width: 0.55, height: 0.90 }
            };
        }
    }

    async generate() {
        let svg;
        if (this.layout === 'mobile') {
            svg = this.generateMobileSVG();
        } else if (this.layout === 'iphone-lock') {
            svg = this.generateiPhoneLockSVG();
        } else {
            svg = this.generateDesktopSVG();
        }

        const buffer = await sharp(Buffer.from(svg))
            .png()
            .toBuffer();

        return buffer;
    }

    generateDesktopSVG() {
        const zones = this.getLayoutZones(false);

        // Calculate absolute positions from zones
        const dateZone = {
            x: this.width * zones.date.left,
            y: this.height * zones.date.top,
            width: this.width * zones.date.width,
            height: this.height * zones.date.height
        };

        const gridZone = {
            x: this.width * zones.grid.left,
            y: this.height * zones.grid.top,
            width: this.width * zones.grid.width,
            height: this.height * zones.grid.height
        };

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Add filters
        svg += `<defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>`;

        // Background
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        // Date Zone Content
        const dateSize = dateZone.width * 0.4;
        const dayText = this.currentDate.getDate().toString().padStart(2, '0');

        // Day number
        svg += `<text x="${dateZone.x}" y="${dateZone.y + dateSize * 0.9}"
                font-family="${FONT_SANS}"
                font-size="${dateSize}" font-weight="900" fill="${this.colors.text}">${dayText}</text>`;

        // Month and Year (positioned to the right of day number, smaller)
        const metaSize = dateSize * 0.25;
        const metaX = dateZone.x + (dayText.length * dateSize * 0.6);
        const metaY = dateZone.y + dateSize * 0.7;

        svg += `<text x="${metaX}" y="${metaY}"
                font-family="${FONT_SANS}"
                font-size="${metaSize}" font-weight="700" fill="${this.colors.accent}">${this.monthNames[this.currentDate.getMonth()]}</text>`;

        svg += `<text x="${metaX}" y="${metaY + metaSize * 1.3}"
                font-family="${FONT_SANS}"
                font-size="${metaSize}" font-weight="400" fill="${this.colors.secondary}">${this.currentYear}</text>`;

        // Progress bar
        const barY = dateZone.y + dateSize + (dateZone.height * 0.08);
        const barHeight = dateZone.width * 0.06;
        const barWidth = dateZone.width;

        // Background bar
        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.muted}"/>`;

        // Progress fill
        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth * this.progressPercent}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.accent}"/>`;

        // Stats below progress bar
        const statsY = barY + barHeight + (barWidth * 0.08);
        const statNumSize = barWidth * 0.12;
        const statLabelSize = barWidth * 0.04;

        // Left: Finished
        svg += `<text x="${dateZone.x}" y="${statsY + statNumSize}"
                font-family="${FONT_SANS}"
                font-size="${statNumSize}" font-weight="900" fill="${this.colors.text}">${this.dayOfYear}</text>`;

        svg += `<text x="${dateZone.x}" y="${statsY + statNumSize + statLabelSize + 10}"
                font-family="${FONT_SANS}"
                font-size="${statLabelSize}" font-weight="500" fill="${this.colors.secondary}">FINISHED</text>`;

        // Right: Remaining
        const remainingText = this.remainingDays.toString();
        const remainingNumWidth = remainingText.length * statNumSize * 0.6;

        svg += `<text x="${dateZone.x + barWidth - remainingNumWidth}" y="${statsY + statNumSize}"
                font-family="${FONT_SANS}"
                font-size="${statNumSize}" font-weight="900" fill="${this.colors.text}">${remainingText}</text>`;

        svg += `<text x="${dateZone.x + barWidth}" y="${statsY + statNumSize + statLabelSize + 10}"
                text-anchor="end" font-family="${FONT_SANS}"
                font-size="${statLabelSize}" font-weight="500" fill="${this.colors.secondary}">REMAINING</text>`;

        // Quote - positioned at bottom of date zone
        const quoteY = dateZone.y + dateZone.height - (barWidth * 0.3);
        const quoteSize = barWidth * 0.065;

        // Quote mark
        svg += `<text x="${dateZone.x}" y="${quoteY}"
                font-family="${FONT_SERIF}"
                font-size="${barWidth * 0.2}" font-weight="900" fill="${this.colors.muted}" opacity="0.3">"</text>`;

        // Quote text (wrapped)
        const words = this.quote.split(' ');
        let line = '';
        let lines = [];
        const maxChars = 30;

        for (let word of words) {
            const testLine = line + word + ' ';
            if (testLine.length > maxChars && line.length > 0) {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        if (line.length > 0) lines.push(line.trim());

        lines.forEach((l, i) => {
            svg += `<text x="${dateZone.x + (barWidth * 0.12)}" y="${quoteY + (barWidth * 0.1) + i * quoteSize * 1.3}"
                    font-family="${FONT_SANS}"
                    font-size="${quoteSize}" font-weight="300" font-style="italic"
                    fill="${this.colors.text}" opacity="0.7">${l}</text>`;
        });

        // Matrix Grid
        svg += this.generateMatrixSVG(gridZone.x, gridZone.y, gridZone.width, gridZone.height, true);

        svg += '</svg>';
        return svg;
    }

    generateMobileSVG() {
        const zones = this.getLayoutZones(true);

        // Calculate absolute positions from zones
        const dateZone = {
            x: this.width * zones.date.left,
            y: this.height * zones.date.top,
            width: this.width * zones.date.width,
            height: this.height * zones.date.height
        };

        const gridZone = {
            x: this.width * zones.grid.left,
            y: this.height * zones.grid.top,
            width: this.width * zones.grid.width,
            height: this.height * zones.grid.height
        };

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Add filters
        svg += `<defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>`;

        // Background
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        // Date Zone Content
        const dateSize = dateZone.height * 0.5;
        const dayText = this.currentDate.getDate().toString().padStart(2, '0');

        // Day number
        svg += `<text x="${dateZone.x}" y="${dateZone.y + dateSize * 0.9}"
                font-family="${FONT_SANS}"
                font-size="${dateSize}" font-weight="900" fill="${this.colors.text}">${dayText}</text>`;

        // Month and Year
        const metaSize = dateSize * 0.25;
        const metaX = dateZone.x + (dayText.length * dateSize * 0.6);
        const metaY = dateZone.y + dateSize * 0.7;

        svg += `<text x="${metaX}" y="${metaY}"
                font-family="${FONT_SANS}"
                font-size="${metaSize}" font-weight="700" fill="${this.colors.accent}">${this.monthNames[this.currentDate.getMonth()]}</text>`;

        svg += `<text x="${metaX}" y="${metaY + metaSize * 1.3}"
                font-family="${FONT_SANS}"
                font-size="${metaSize}" font-weight="400" fill="${this.colors.secondary}">${this.currentYear}</text>`;

        // Progress bar
        const barY = dateZone.y + dateSize + (metaSize * 2.8);
        const barHeight = metaSize * 0.3;
        const barWidth = dateZone.width;

        // Background bar
        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.muted}"/>`;

        // Progress fill
        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth * this.progressPercent}" height="${barHeight}"
                rx="${barHeight / 2}" fill="${this.colors.accent}"/>`;

        // Stats
        const labelY = barY + barHeight + (metaSize * 0.5);
        const labelSize = metaSize * 0.7;

        svg += `<text x="${dateZone.x}" y="${labelY + labelSize}"
                font-family="${FONT_SANS}"
                font-size="${labelSize}" font-weight="700" fill="${this.colors.secondary}">${this.dayOfYear} FINISHED</text>`;

        svg += `<text x="${dateZone.x + barWidth}" y="${labelY + labelSize}" text-anchor="end"
                font-family="${FONT_SANS}"
                font-size="${labelSize}" font-weight="700" fill="${this.colors.secondary}">${this.remainingDays} REMAINING</text>`;

        // Quote - positioned right after the stats labels
        const quoteSize = metaSize * 0.6;
        const quoteY = labelY + labelSize + (metaSize * 1.2);

        // Wrap quote text to fit within width
        svg += `<text x="${dateZone.x}" y="${quoteY}"
                font-family="${FONT_SANS}"
                font-size="${quoteSize}" font-weight="300" font-style="italic"
                fill="${this.colors.text}" opacity="0.6">"${this.quote}"</text>`;

        // Matrix Grid
        svg += this.generateMatrixSVG(gridZone.x, gridZone.y, gridZone.width, gridZone.height, false);

        svg += '</svg>';
        return svg;
    }

    generateiPhoneLockSVG() {
        // iPhone lock screen layout with grid-only design
        // Top 30% reserved for iOS lock screen (time, date, widgets)
        // Content in middle 55%
        // Bottom 15% for minimal info

        const topReserved = this.height * 0.30;
        const contentHeight = this.height * 0.55;
        const bottomReserved = this.height * 0.15;

        const contentY = topReserved;
        const padding = this.width * 0.05;
        const contentWidth = this.width - (padding * 2);

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Add filters
        svg += `<defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>`;

        // Background
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        // Week day labels at top of content area
        const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const currentDayOfWeek = this.currentDate.getDay();
        const labelSize = this.width * 0.04;
        const labelY = contentY + padding;
        const colWidth = contentWidth / 7;

        DAYS_HEADER.forEach((day, i) => {
            const color = (i === currentDayOfWeek) ? this.colors.accent : this.colors.secondary;
            const labelX = padding + (i * colWidth) + (colWidth / 2);
            svg += `<text x="${labelX}" y="${labelY + labelSize * 0.6}"
                    text-anchor="middle"
                    font-family="${FONT_SANS}"
                    font-size="${labelSize}" font-weight="bold"
                    fill="${color}">${day}</text>`;
        });

        // Grid area
        const gridY = labelY + labelSize + (padding * 0.5);
        const gridHeight = contentHeight - labelSize - (padding * 1.5);

        // Draw grid
        const firstDayOfYear = new Date(this.currentYear, 0, 1);
        const firstDayIndex = firstDayOfYear.getDay();

        const cols = 7;
        const rows = 53;
        const gap = this.width * 0.005;

        const cellWidth = (contentWidth - (gap * (cols - 1))) / cols;
        const cellHeight = (gridHeight - (gap * (rows - 1))) / rows;

        // Draw all cells
        for (let i = 0; i < 371; i++) {
            const col = i % 7;
            const row = Math.floor(i / 7);

            const dIndex = (row * 7) + col - firstDayIndex;

            if (dIndex < 0 || dIndex >= this.totalDays) {
                continue;
            }

            const dayNumber = dIndex + 1;
            const cellX = padding + col * (cellWidth + gap);
            const cellY = gridY + row * (cellHeight + gap);

            // Determine color
            let fill;
            const isPast = dayNumber < this.dayOfYear;
            const isToday = dayNumber === this.dayOfYear;

            if (isToday) {
                fill = this.colors.accent;
            } else if (isPast) {
                fill = this.colors.text;
            } else {
                fill = this.colors.secondary;
            }

            // Generate shape
            if (this.shape === 'circle') {
                const radius = Math.min(cellWidth, cellHeight) / 2;
                svg += `<circle cx="${cellX + cellWidth / 2}" cy="${cellY + cellHeight / 2}" r="${radius}"
                        fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else if (this.shape === 'square') {
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}"
                        fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else {
                const radius = Math.min(cellWidth, cellHeight) * 0.3;
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}"
                        rx="${radius}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            }
        }

        // Bottom info: "Xd left · Y%"
        const bottomY = this.height - (bottomReserved / 2);
        const infoSize = this.width * 0.035;
        const percentComplete = Math.round(this.progressPercent * 100);

        svg += `<text x="${this.width / 2}" y="${bottomY}"
                text-anchor="middle"
                font-family="${FONT_SANS}"
                font-size="${infoSize}" font-weight="500"
                fill="${this.colors.accent}">${this.remainingDays}d left · ${percentComplete}%</text>`;

        svg += '</svg>';
        return svg;
    }

    generateMatrixSVG(x, y, width, height, isDesktop) {
        const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const firstDayOfYear = new Date(this.currentYear, 0, 1);
        const firstDayIndex = firstDayOfYear.getDay();
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
                svg += `<text x="${x + labelSize / 2}" y="${labelY + labelSize * 0.2}"
                        text-anchor="middle"
                        font-family="${FONT_SANS}"
                        font-size="${labelSize * 0.5}" font-weight="bold"
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
                svg += `<text x="${labelX}" y="${y + labelSize * 0.6}"
                        text-anchor="middle"
                        font-family="${FONT_SANS}"
                        font-size="${labelSize * 0.5}" font-weight="bold"
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
                row = i % 7;
                col = Math.floor(i / 7);
            } else {
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

            const dayNumber = dIndex + 1;
            const cellX = gridX + col * (cellWidth + gap);
            const cellY = gridY + row * (cellHeight + gap);

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
