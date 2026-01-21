/**
 * Chronos 4K - Year Progress Visualization
 * Ultra-modern data-driven dashboard with Matrix grid
 */

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

class ChronosApp {
    constructor() {
        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.dayOfYear = this.getDayOfYear(this.currentDate);
        this.totalDays = this.isLeapYear(this.currentYear) ? 366 : 365;

        this.theme = 'cyber';
        this.shape = 'rounded';
        this.layout = 'desktop';

        this.init();
    }

    init() {
        this.checkURLParams();
        this.updateDate();
        this.updateProgress();
        this.updateQuote();
        this.generateMatrix();
        this.attachEventListeners();

        // Auto-export if requested
        if (this.autoExport) {
            setTimeout(() => this.exportTo4K(), 1000);
        }
    }

    checkURLParams() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('theme')) {
            this.theme = params.get('theme');
        }
        if (params.has('shape')) {
            this.shape = params.get('shape');
        }
        if (params.has('device')) {
            this.layout = params.get('device');
        }
        if (params.has('auto') && params.get('auto') === 'true') {
            this.autoExport = true;
        }

        // Apply theme
        document.body.className = `${this.theme} shape-${this.shape}`;

        // Apply layout
        const app = document.getElementById('app');
        app.className = `container ${this.layout}-layout`;

        // Update selects
        document.getElementById('themeSelect').value = this.theme;
        document.getElementById('shapeSelect').value = this.shape;
        document.getElementById('layoutSelect').value = this.layout;
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

    updateDate() {
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

        document.getElementById('dateNumber').textContent = this.currentDate.getDate();
        document.getElementById('dateMonth').textContent = months[this.currentDate.getMonth()];
        document.getElementById('dateYear').textContent = this.currentYear;
    }

    updateProgress() {
        const finished = this.dayOfYear;
        const remaining = this.totalDays - this.dayOfYear;
        const percentage = (finished / this.totalDays) * 100;

        document.getElementById('finishedDays').textContent = finished;
        document.getElementById('remainingDays').textContent = remaining;
        document.getElementById('progressBar').style.width = `${percentage}%`;
    }

    updateQuote() {
        // Use day of year to pick a consistent daily quote
        const quoteIndex = this.dayOfYear % QUOTES.length;
        document.getElementById('quoteText').textContent = QUOTES[quoteIndex];
    }

    generateMatrix() {
        const grid = document.getElementById('matrixGrid');
        grid.innerHTML = '';

        for (let day = 1; day <= this.totalDays; day++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';

            if (day < this.dayOfYear) {
                cell.classList.add('past');
            } else if (day === this.dayOfYear) {
                cell.classList.add('today');
            } else {
                cell.classList.add('future');
            }

            grid.appendChild(cell);
        }
    }

    attachEventListeners() {
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.theme = e.target.value;
            document.body.className = `${this.theme} shape-${this.shape}`;
        });

        document.getElementById('shapeSelect').addEventListener('change', (e) => {
            this.shape = e.target.value;
            document.body.className = `${this.theme} shape-${this.shape}`;
        });

        document.getElementById('layoutSelect').addEventListener('change', (e) => {
            this.layout = e.target.value;
            const app = document.getElementById('app');
            app.className = `container ${this.layout}-layout`;
            this.generateMatrix(); // Regenerate for new layout
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportTo4K();
        });
    }

    async exportTo4K() {
        const canvas = document.getElementById('exportCanvas');
        const ctx = canvas.getContext('2d');

        // Set 4K dimensions based on layout
        if (this.layout === 'mobile') {
            canvas.width = 2160;  // 4K Mobile (9:16)
            canvas.height = 3840;
        } else {
            canvas.width = 3840;  // 4K Desktop (16:9)
            canvas.height = 2160;
        }

        // Scale factor for high-DPI rendering
        const scale = canvas.width / window.innerWidth;

        // Get computed styles
        const computedStyle = getComputedStyle(document.body);
        const bgColor = computedStyle.getPropertyValue('--bg').trim();
        const accentColor = computedStyle.getPropertyValue('--accent').trim();
        const textColor = computedStyle.getPropertyValue('--text').trim();
        const mutedColor = computedStyle.getPropertyValue('--muted').trim();
        const dimColor = computedStyle.getPropertyValue('--dim').trim();

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate layout dimensions
        const padding = canvas.width * 0.03;
        const gap = canvas.width * 0.02;

        if (this.layout === 'desktop') {
            await this.renderDesktop(ctx, canvas, scale, {bgColor, accentColor, textColor, mutedColor, dimColor, padding, gap});
        } else {
            await this.renderMobile(ctx, canvas, scale, {bgColor, accentColor, textColor, mutedColor, dimColor, padding, gap});
        }

        // Download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chronos-4k-${this.layout}-${this.theme}-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    async renderDesktop(ctx, canvas, scale, colors) {
        const {bgColor, accentColor, textColor, mutedColor, dimColor, padding, gap} = colors;

        // Sidebar dimensions
        const sidebarWidth = canvas.width * 0.28;
        const matrixX = sidebarWidth + gap + padding;
        const matrixWidth = canvas.width - matrixX - padding;
        const matrixHeight = canvas.height - (padding * 2);

        // Date Display
        ctx.fillStyle = textColor;
        ctx.font = `900 ${canvas.width * 0.12}px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(this.currentDate.getDate(), padding, padding + canvas.width * 0.11);

        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        ctx.fillStyle = accentColor;
        ctx.font = `700 ${canvas.width * 0.025}px Inter, sans-serif`;
        ctx.fillText(months[this.currentDate.getMonth()], padding, padding + canvas.width * 0.14);

        ctx.fillStyle = mutedColor;
        ctx.font = `300 ${canvas.width * 0.018}px Inter, sans-serif`;
        ctx.fillText(this.currentYear, padding, padding + canvas.width * 0.165);

        // Progress Bar
        const progressY = padding + canvas.width * 0.22;
        const barHeight = canvas.height * 0.012;
        const barWidth = sidebarWidth;

        // Progress background
        ctx.fillStyle = dimColor;
        ctx.beginPath();
        ctx.roundRect(padding, progressY, barWidth, barHeight, barHeight / 2);
        ctx.fill();

        // Progress fill
        const progressPercent = (this.dayOfYear / this.totalDays);
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(padding, progressY, barWidth * progressPercent, barHeight, barHeight / 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Stats
        const statsY = progressY + barHeight + canvas.height * 0.04;
        ctx.fillStyle = textColor;
        ctx.font = `900 ${canvas.width * 0.05}px Inter, sans-serif`;
        ctx.fillText(this.dayOfYear, padding, statsY);
        ctx.fillText(this.totalDays - this.dayOfYear, padding + sidebarWidth * 0.55, statsY);

        ctx.fillStyle = mutedColor;
        ctx.font = `600 ${canvas.width * 0.01}px Inter, sans-serif`;
        ctx.fillText('FINISHED', padding, statsY + canvas.height * 0.03);
        ctx.fillText('REMAINING', padding + sidebarWidth * 0.55, statsY + canvas.height * 0.03);

        // Quote Card
        const quoteY = canvas.height - padding - canvas.height * 0.25;
        const quoteHeight = canvas.height * 0.2;

        // Quote background
        ctx.fillStyle = dimColor;
        ctx.beginPath();
        ctx.roundRect(padding, quoteY, sidebarWidth, quoteHeight, canvas.width * 0.01);
        ctx.fill();

        // Quote accent line
        ctx.fillStyle = accentColor;
        ctx.fillRect(padding, quoteY, 4, quoteHeight);

        // Quote mark
        ctx.fillStyle = mutedColor;
        ctx.globalAlpha = 0.15;
        ctx.font = `italic 900 ${canvas.width * 0.12}px Georgia, serif`;
        ctx.fillText('"', padding + canvas.width * 0.015, quoteY + canvas.height * 0.1);
        ctx.globalAlpha = 1;

        // Quote text
        const quoteIndex = this.dayOfYear % QUOTES.length;
        const quoteText = QUOTES[quoteIndex];
        ctx.fillStyle = textColor;
        ctx.font = `italic 300 ${canvas.width * 0.013}px Inter, sans-serif`;
        this.wrapText(ctx, quoteText, padding + canvas.width * 0.02, quoteY + canvas.height * 0.08, sidebarWidth - canvas.width * 0.04, canvas.width * 0.02);

        // Render Matrix
        this.renderMatrixGrid(ctx, matrixX, padding, matrixWidth, matrixHeight, colors, true);
    }

    async renderMobile(ctx, canvas, scale, colors) {
        const {bgColor, accentColor, textColor, mutedColor, dimColor, padding, gap} = colors;

        // Header dimensions
        const headerHeight = canvas.height * 0.22;
        const matrixY = headerHeight + gap;
        const matrixHeight = canvas.height - matrixY - padding;

        // Date Display
        ctx.fillStyle = textColor;
        ctx.font = `900 ${canvas.width * 0.18}px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(this.currentDate.getDate(), padding, padding + canvas.width * 0.16);

        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        ctx.fillStyle = accentColor;
        ctx.font = `700 ${canvas.width * 0.05}px Inter, sans-serif`;
        ctx.fillText(months[this.currentDate.getMonth()], padding, padding + canvas.width * 0.22);

        ctx.fillStyle = mutedColor;
        ctx.font = `300 ${canvas.width * 0.035}px Inter, sans-serif`;
        ctx.fillText(this.currentYear, padding, padding + canvas.width * 0.26);

        // Progress Bar
        const progressY = padding + canvas.width * 0.32;
        const barHeight = canvas.height * 0.008;
        const barWidth = canvas.width - (padding * 2);

        // Progress background
        ctx.fillStyle = dimColor;
        ctx.beginPath();
        ctx.roundRect(padding, progressY, barWidth, barHeight, barHeight / 2);
        ctx.fill();

        // Progress fill
        const progressPercent = (this.dayOfYear / this.totalDays);
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(padding, progressY, barWidth * progressPercent, barHeight, barHeight / 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Stats
        const statsY = progressY + barHeight + canvas.height * 0.025;
        ctx.fillStyle = textColor;
        ctx.font = `900 ${canvas.width * 0.11}px Inter, sans-serif`;
        ctx.fillText(this.dayOfYear, padding, statsY);

        const remainingX = canvas.width - padding - ctx.measureText(this.totalDays - this.dayOfYear).width;
        ctx.fillText(this.totalDays - this.dayOfYear, remainingX, statsY);

        ctx.fillStyle = mutedColor;
        ctx.font = `600 ${canvas.width * 0.028}px Inter, sans-serif`;
        ctx.fillText('FINISHED', padding, statsY + canvas.height * 0.02);
        const remainingLabelX = canvas.width - padding - ctx.measureText('REMAINING').width;
        ctx.fillText('REMAINING', remainingLabelX, statsY + canvas.height * 0.02);

        // Render Matrix
        this.renderMatrixGrid(ctx, padding, matrixY, canvas.width - (padding * 2), matrixHeight, colors, false);
    }

    renderMatrixGrid(ctx, x, y, width, height, colors, isDesktop) {
        const {accentColor, mutedColor, dimColor} = colors;

        const cols = isDesktop ? 53 : 7;
        const rows = isDesktop ? 7 : 53;
        const gap = Math.min(width, height) * 0.003;

        const cellWidth = (width - (gap * (cols - 1))) / cols;
        const cellHeight = (height - (gap * (rows - 1))) / rows;

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

            // Determine color based on day status
            if (day < this.dayOfYear) {
                ctx.fillStyle = mutedColor;
            } else if (day === this.dayOfYear) {
                ctx.fillStyle = accentColor;
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = 15;
            } else {
                ctx.fillStyle = dimColor;
                ctx.globalAlpha = 0.3;
            }

            // Draw shape
            if (this.shape === 'circle') {
                const radius = Math.min(cellWidth, cellHeight) / 2;
                ctx.beginPath();
                ctx.arc(cellX + cellWidth / 2, cellY + cellHeight / 2, radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shape === 'square') {
                ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
            } else { // rounded
                const radius = Math.min(cellWidth, cellHeight) * 0.2;
                ctx.beginPath();
                ctx.roundRect(cellX, cellY, cellWidth, cellHeight, radius);
                ctx.fill();
            }

            // Reset effects
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChronosApp());
} else {
    new ChronosApp();
}
