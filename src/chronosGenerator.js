
const sharp = require('sharp');
const TextToSVG = require('text-to-svg');
const path = require('path');
const { getDailyQuote } = require('./quote-reader');

// Theme definitions
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

        this.colors = THEMES[this.theme] || THEMES.cyber;

        if (this.layout === 'mobile') {
            this.width = 2160;
            this.height = 3840;
        } else if (this.layout === 'iphone-lock') {
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

        // Get daily quote from CSV with author
        const quoteData = getDailyQuote(this.dayOfYear);
        this.quote = quoteData.text;
        this.quoteAuthor = quoteData.author;

        // Initialize font engines
        try {
            // Check for fonts in different locations for different environments
            const possiblePaths = [
                path.join(__dirname, '../fonts/LiberationSans-Regular.ttf'),
                path.join(__dirname, '../fonts/LiberationSans-Bold.ttf'),
                // Fallback for Netlify/Vercel standard paths if needed
                path.join(process.cwd(), 'fonts/LiberationSans-Regular.ttf'),
                path.join(process.cwd(), 'fonts/LiberationSans-Bold.ttf'),
            ];

            let regularPath, boldPath;

            // Find existing paths
            for (const p of possiblePaths) {
                try {
                    require('fs').accessSync(p);
                    if (p.includes('Regular') && !regularPath) regularPath = p;
                    if (p.includes('Bold') && !boldPath) boldPath = p;
                } catch (e) { }
            }

            if (!regularPath || !boldPath) {
                console.warn('[Chronos] Fonts not found, using system fallback logic (this may fail on serverless)');
                // If we can't find files, text-to-svg tries to look system-wide, but that fails on Lambda
                // We'll rely on what we found or default to synchronous load from strict relative path
                regularPath = regularPath || path.join(__dirname, '../fonts/LiberationSans-Regular.ttf');
                boldPath = boldPath || path.join(__dirname, '../fonts/LiberationSans-Bold.ttf');
            }

            this.textToSVG = TextToSVG.loadSync(regularPath);
            this.textToSVGBold = TextToSVG.loadSync(boldPath);
        } catch (e) {
            console.error('Failed to load local fonts for vectorization:', e);
            // Fallback to whatever default text-to-svg has (likely none, so this will error later if not caught)
        }
    }

    // Helper to generic SVG path from text
    // options: { x, y, fontSize, anchor, attributes: { fill, etc } }
    // anchor: 'top' | 'middle' | 'bottom'
    textPath(text, x, y, fontSize, options = {}) {
        const engine = options.fontWeight && (options.fontWeight === 'bold' || options.fontWeight >= 700)
            ? this.textToSVGBold
            : this.textToSVG;

        if (!engine) return ''; // Should not happen if loaded correctly

        const attributes = {
            fill: options.fill || this.colors.text,
            ...options.attributes
        };

        // TextToSVG anchors are different from SVG text-anchor
        // We'll calculate metrics to position exactly
        const metrics = engine.getMetrics(text, { fontSize });

        let localX = x;
        let localY = y;

        // Alignment logic
        if (options.anchor === 'middle' || options.anchor === 'center') {
            localX -= metrics.width / 2;
        } else if (options.anchor === 'end' || options.anchor === 'right') {
            localX -= metrics.width;
        }

        // Vertical alignment approximation
        // SVG text y is usually baseline. TextPath d is usually top-left based or similar depending on library
        // TextToSVG generates path relative to baseline for y=0

        // Pass to library
        return engine.getD(text, {
            x: localX,
            y: localY,
            fontSize,
            attributes
        });
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
        return await sharp(Buffer.from(svg)).png().toBuffer();
    }

    generateDesktopSVG() {
        const zones = this.getLayoutZones(false);
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
        svg += `<defs><filter id="glow"><feGaussianBlur stdDeviation="10" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        // Date Zone Content - Improved layout
        const dateSize = dateZone.width * 0.45; // Adjusted to leave room for month/year
        const dayText = this.currentDate.getDate().toString().padStart(2, '0');

        // Day number
        svg += `<path fill="${this.colors.text}" d="${this.textPath(dayText, dateZone.x, dateZone.y + dateSize * 0.85, dateSize, { fontWeight: 'bold' })}"/>`;

        // Month and Year - positioned to the right of date, properly aligned
        const metaSize = dateSize * 0.24; // Size for month/year
        const dayMetrics = this.textToSVGBold.getMetrics(dayText, { fontSize: dateSize });
        const metaX = dateZone.x + dayMetrics.width + (dateSize * 0.12); // Space after date
        const metaBaseY = dateZone.y + dateSize * 0.58; // Aligned with middle of date

        svg += `<path fill="${this.colors.accent}" d="${this.textPath(this.monthNames[this.currentDate.getMonth()], metaX, metaBaseY, metaSize, { fontWeight: 'bold' })}"/>`;
        svg += `<path fill="${this.colors.secondary}" d="${this.textPath(this.currentYear.toString(), metaX, metaBaseY + metaSize * 1.25, metaSize, { fontWeight: 'normal' })}"/>`;

        const barY = dateZone.y + dateSize + (dateZone.height * 0.08);
        const barHeight = dateZone.width * 0.06;
        const barWidth = dateZone.width;

        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${this.colors.muted}"/>`;
        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth * this.progressPercent}" height="${barHeight}" rx="${barHeight / 2}" fill="${this.colors.accent}"/>`;

        const statsY = barY + barHeight + (barWidth * 0.08);
        const statNumSize = barWidth * 0.12;
        const statLabelSize = barWidth * 0.04;

        svg += `<path fill="${this.colors.text}" d="${this.textPath(this.dayOfYear.toString(), dateZone.x, statsY + statNumSize, statNumSize, { fontWeight: 'bold' })}"/>`;
        svg += `<path fill="${this.colors.secondary}" d="${this.textPath('FINISHED', dateZone.x, statsY + statNumSize + statLabelSize + 10, statLabelSize, { fontWeight: 'normal' })}"/>`;

        const remainingText = this.remainingDays.toString();
        svg += `<path fill="${this.colors.text}" d="${this.textPath(remainingText, dateZone.x + barWidth, statsY + statNumSize, statNumSize, { fontWeight: 'bold', anchor: 'right' })}"/>`;
        svg += `<path fill="${this.colors.secondary}" d="${this.textPath('REMAINING', dateZone.x + barWidth, statsY + statNumSize + statLabelSize + 10, statLabelSize, { fontWeight: 'normal', anchor: 'right' })}"/>`;

        // Quote - positioned at bottom of date zone
        const quoteY = dateZone.y + dateZone.height - (barWidth * 0.35);
        const quoteSize = barWidth * 0.065;

        // Quote mark - positioned closer to text
        const quoteMarkSize = barWidth * 0.15; // Smaller quote mark (was 0.2)
        const quoteMarkX = dateZone.x + (barWidth * 0.02);
        svg += `<path fill="${this.colors.muted}" opacity="0.25" d="${this.textPath('"', quoteMarkX, quoteY, quoteMarkSize, { fontWeight: 'bold' })}"/>`;

        // Quote text (wrapped) - moved closer to quote mark
        const quoteTextX = dateZone.x + (barWidth * 0.08); // Closer to quote mark (was 0.12)
        const quoteLines = this.wrapText(this.quote, dateZone.width * 0.85, quoteSize);
        let currentY = quoteY + (barWidth * 0.1);
        quoteLines.forEach((l, i) => {
            svg += `<path fill="${this.colors.text}" opacity="0.7" d="${this.textPath(l, quoteTextX, currentY + i * quoteSize * 1.3, quoteSize, { fontWeight: 'normal' })}"/>`;
        });

        // Author name - positioned below the quote
        const authorY = currentY + (quoteLines.length * quoteSize * 1.3) + (quoteSize * 0.6);
        const authorSize = quoteSize * 0.85;
        svg += `<path fill="${this.colors.secondary}" opacity="0.8" d="${this.textPath('— ' + this.quoteAuthor, quoteTextX, authorY, authorSize, { fontWeight: 'normal' })}"/>`;

        svg += this.generateMatrixSVG(gridZone.x, gridZone.y, gridZone.width, gridZone.height, true);
        svg += '</svg>';
        return svg;
    }

    generateMobileSVG() {
        const zones = this.getLayoutZones(true);
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
        svg += `<defs><filter id="glow"><feGaussianBlur stdDeviation="10" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        const dateSize = dateZone.height * 0.45; // Adjusted for mobile
        const dayText = this.currentDate.getDate().toString().padStart(2, '0');

        svg += `<path fill="${this.colors.text}" d="${this.textPath(dayText, dateZone.x, dateZone.y + dateSize * 0.85, dateSize, { fontWeight: 'bold' })}"/>`;

        // Month and Year - positioned to the right of date
        const metaSize = dateSize * 0.24;
        const dayMetrics = this.textToSVGBold.getMetrics(dayText, { fontSize: dateSize });
        const metaX = dateZone.x + dayMetrics.width + (dateSize * 0.12);
        const metaBaseY = dateZone.y + dateSize * 0.58;

        svg += `<path fill="${this.colors.accent}" d="${this.textPath(this.monthNames[this.currentDate.getMonth()], metaX, metaBaseY, metaSize, { fontWeight: 'bold' })}"/>`;
        svg += `<path fill="${this.colors.secondary}" d="${this.textPath(this.currentYear.toString(), metaX, metaBaseY + metaSize * 1.25, metaSize, { fontWeight: 'normal' })}"/>`;

        const barY = dateZone.y + dateSize + (metaSize * 2.8);
        const barHeight = metaSize * 0.3;
        const barWidth = dateZone.width;

        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="${this.colors.muted}"/>`;
        svg += `<rect x="${dateZone.x}" y="${barY}" width="${barWidth * this.progressPercent}" height="${barHeight}" rx="${barHeight / 2}" fill="${this.colors.accent}"/>`;

        const labelY = barY + barHeight + (metaSize * 0.5);
        const labelSize = metaSize * 0.7;

        svg += `<path fill="${this.colors.secondary}" d="${this.textPath(this.dayOfYear + ' FINISHED', dateZone.x, labelY + labelSize, labelSize, { fontWeight: 'bold' })}"/>`;
        svg += `<path fill="${this.colors.secondary}" d="${this.textPath(this.remainingDays + ' REMAINING', dateZone.x + barWidth, labelY + labelSize, labelSize, { fontWeight: 'bold', anchor: 'right' })}"/>`;

        // Quote - positioned right after the stats labels
        const quoteSize = metaSize * 0.6;
        const quoteY = labelY + labelSize + (metaSize * 1.5);

        // Quote mark
        const quoteMarkSize = quoteSize * 1.5;
        svg += `<path fill="${this.colors.muted}" opacity="0.25" d="${this.textPath('"', dateZone.x, quoteY, quoteMarkSize, { fontWeight: 'bold' })}"/>`;

        // Quote text (wrapped for mobile)
        const quoteTextX = dateZone.x + (quoteMarkSize * 0.5);
        const quoteLines = this.wrapText(this.quote, dateZone.width * 0.9, quoteSize);
        let mobileCurrentY = quoteY + (quoteSize * 0.4);
        quoteLines.forEach((l, i) => {
            svg += `<path fill="${this.colors.text}" opacity="0.6" d="${this.textPath(l, quoteTextX, mobileCurrentY + i * quoteSize * 1.3, quoteSize, { fontWeight: 'normal' })}"/>`;
        });

        // Author name - positioned below the quote
        const mobileAuthorY = mobileCurrentY + (quoteLines.length * quoteSize * 1.3) + (quoteSize * 0.5);
        const mobileAuthorSize = quoteSize * 0.85;
        svg += `<path fill="${this.colors.secondary}" opacity="0.8" d="${this.textPath('— ' + this.quoteAuthor, quoteTextX, mobileAuthorY, mobileAuthorSize, { fontWeight: 'normal' })}"/>`;

        svg += this.generateMatrixSVG(gridZone.x, gridZone.y, gridZone.width, gridZone.height, false);
        svg += '</svg>';
        return svg;
    }

    generateiPhoneLockSVG() {
        const topReserved = this.height * 0.30;
        const contentHeight = this.height * 0.55;
        const bottomReserved = this.height * 0.15;
        const contentY = topReserved;
        const padding = this.width * 0.05;
        const contentWidth = this.width - (padding * 2);

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
        svg += `<defs><filter id="glow"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.bg}"/>`;

        const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const currentDayOfWeek = this.currentDate.getDay();
        const labelSize = this.width * 0.04;
        const labelY = contentY + padding;
        const colWidth = contentWidth / 7;

        DAYS_HEADER.forEach((day, i) => {
            const color = (i === currentDayOfWeek) ? this.colors.accent : this.colors.secondary;
            const labelX = padding + (i * colWidth) + (colWidth / 2);
            svg += `<path fill="${color}" d="${this.textPath(day, labelX, labelY + labelSize * 0.6, labelSize, { fontWeight: 'bold', anchor: 'middle' })}"/>`;
        });

        const gridY = labelY + labelSize + (padding * 0.5);
        const gridHeight = contentHeight - labelSize - (padding * 1.5);
        const firstDayOfYear = new Date(this.currentYear, 0, 1);
        const firstDayIndex = firstDayOfYear.getDay();
        const gap = this.width * 0.005;
        const cellWidth = (contentWidth - (gap * 6)) / 7;
        const cellHeight = (gridHeight - (gap * 52)) / 53;

        for (let i = 0; i < 371; i++) {
            const col = i % 7;
            const row = Math.floor(i / 7);
            const dIndex = (row * 7) + col - firstDayIndex;

            if (dIndex < 0 || dIndex >= this.totalDays) continue;

            const dayNumber = dIndex + 1;
            const cellX = padding + col * (cellWidth + gap);
            const cellY = gridY + row * (cellHeight + gap);
            const isToday = dayNumber === this.dayOfYear;
            const fill = isToday ? this.colors.accent : (dayNumber < this.dayOfYear ? this.colors.text : this.colors.secondary);

            if (this.shape === 'circle') {
                const radius = Math.min(cellWidth, cellHeight) / 2;
                svg += `<circle cx="${cellX + cellWidth / 2}" cy="${cellY + cellHeight / 2}" r="${radius}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else if (this.shape === 'square') {
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else {
                const radius = Math.min(cellWidth, cellHeight) * 0.3;
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}" rx="${radius}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            }
        }

        const bottomY = this.height - (bottomReserved / 2);
        const infoSize = this.width * 0.035;
        const percentComplete = Math.round(this.progressPercent * 100);
        svg += `<path fill="${this.colors.accent}" d="${this.textPath(this.remainingDays + 'd left · ' + percentComplete + '%', this.width / 2, bottomY, infoSize, { fontWeight: 'bold', anchor: 'middle' })}"/>`;

        svg += '</svg>';
        return svg;
    }

    generateMatrixSVG(x, y, width, height, isDesktop) {
        const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const firstDayOfYear = new Date(this.currentYear, 0, 1);
        const firstDayIndex = firstDayOfYear.getDay();
        const currentDayOfWeek = this.currentDate.getDay();

        let svg = '';
        const labelSize = isDesktop ? width * 0.03 : height * 0.04;
        let gridX = x;
        let gridY = y;
        let gridWidth = width;
        let gridHeight = height;

        if (isDesktop) {
            gridX += labelSize;
            gridWidth -= labelSize;
            const rowHeight = gridHeight / 7;
            DAYS_HEADER.forEach((day, i) => {
                const color = (i === currentDayOfWeek) ? this.colors.accent : this.colors.secondary;
                const labelY = y + (i * rowHeight) + (rowHeight / 2);
                svg += `<path fill="${color}" d="${this.textPath(day, x + labelSize / 2, labelY + labelSize * 0.2, labelSize * 0.5, { fontWeight: 'bold', anchor: 'middle' })}"/>`;
            });
        } else {
            gridY += labelSize;
            gridHeight -= labelSize;
            const colWidth = gridWidth / 7;
            DAYS_HEADER.forEach((day, i) => {
                const color = (i === currentDayOfWeek) ? this.colors.accent : this.colors.secondary;
                const labelX = x + (i * colWidth) + (colWidth / 2);
                svg += `<path fill="${color}" d="${this.textPath(day, labelX, y + labelSize * 0.6, labelSize * 0.5, { fontWeight: 'bold', anchor: 'middle' })}"/>`;
            });
        }

        const cols = isDesktop ? 53 : 7;
        const rows = isDesktop ? 7 : 53;
        const gap = Math.min(gridWidth, gridHeight) * 0.002;
        const cellWidth = (gridWidth - (gap * (cols - 1))) / cols;
        const cellHeight = (gridHeight - (gap * (rows - 1))) / rows;

        for (let i = 0; i < 371; i++) {
            let col, row;
            if (isDesktop) { row = i % 7; col = Math.floor(i / 7); }
            else { col = i % 7; row = Math.floor(i / 7); }

            const dIndex = isDesktop ? (col * 7) + row - firstDayIndex : (row * 7) + col - firstDayIndex;
            if (dIndex < 0 || dIndex >= this.totalDays) continue;

            const dayNumber = dIndex + 1;
            const cellX = gridX + col * (cellWidth + gap);
            const cellY = gridY + row * (cellHeight + gap);
            const isToday = dayNumber === this.dayOfYear;
            const fill = isToday ? this.colors.accent : (dayNumber < this.dayOfYear ? this.colors.secondary : this.colors.muted);

            if (this.shape === 'circle') {
                const radius = Math.min(cellWidth, cellHeight) / 2;
                svg += `<circle cx="${cellX + cellWidth / 2}" cy="${cellY + cellHeight / 2}" r="${radius}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else if (this.shape === 'square') {
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            } else {
                const radius = Math.min(cellWidth, cellHeight) * 0.3;
                svg += `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}" rx="${radius}" fill="${fill}"${isToday ? ' filter="url(#glow)"' : ''}/>`;
            }
        }
        return svg;
    }

    wrapText(text, maxWidth, fontSize) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + " " + word;
            const metrics = this.textToSVG.getMetrics(testLine, { fontSize });
            if (metrics.width < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}

module.exports = ChronosGenerator;
