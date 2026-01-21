const sharp = require('sharp');

/**
 * Calendar Generator Class (inline for Vercel serverless)
 */
class CalendarGenerator {
  constructor(year, device = 'laptop', completedDays = []) {
    this.year = year;
    this.device = device;
    this.completedDays = new Set(completedDays);

    if (device === 'mobile') {
      this.width = 2160;
      this.height = 3840;
    } else {
      this.width = 3840;
      this.height = 2160;
    }

    this.colors = {
      background: '#FFFFFF',
      text: '#2C3E50',
      availableDay: '#E8E8E8',
      availableDayStroke: '#CCCCCC',
      completedDay: '#3498DB',
      monthLabel: '#2C3E50',
      dayLabel: '#7F8C8D'
    };

    this.monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }

  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  getDaysInMonth(month, year) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 1 && this.isLeapYear(year)) return 29;
    return daysInMonth[month];
  }

  getDayOfWeek(year, month, day) {
    const date = new Date(year, month, day);
    let dayOfWeek = date.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return dayOfWeek;
  }

  getDayOfYear(year, month, day) {
    let dayOfYear = day;
    for (let m = 0; m < month; m++) {
      dayOfYear += this.getDaysInMonth(m, year);
    }
    return dayOfYear;
  }

  isCompleted(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfYear = this.getDayOfYear(year, month, day);
    return this.completedDays.has(dateStr) || this.completedDays.has(dayOfYear.toString());
  }

  generateMonthSVG(month, x, y, width, height) {
    const monthPadding = 20;
    const monthNameHeight = 50;
    const dayLabelHeight = 30;
    let svg = '';

    svg += `<text x="${x + width / 2}" y="${y + monthNameHeight}"
      font-family="Arial, sans-serif" font-size="32" font-weight="bold"
      fill="${this.colors.monthLabel}" text-anchor="middle">${this.monthNames[month]}</text>`;

    const gridWidth = width - (2 * monthPadding);
    const gridHeight = height - monthNameHeight - dayLabelHeight - (2 * monthPadding);
    const cellWidth = gridWidth / 7;
    const cellHeight = gridHeight / 6;
    const dayRadius = Math.min(cellWidth, cellHeight) / 3;
    const gridStartX = x + monthPadding;
    const gridStartY = y + monthNameHeight + dayLabelHeight + monthPadding;

    for (let d = 0; d < 7; d++) {
      const labelX = gridStartX + (d * cellWidth) + (cellWidth / 2);
      const labelY = y + monthNameHeight + dayLabelHeight - 5;
      svg += `<text x="${labelX}" y="${labelY}"
        font-family="Arial, sans-serif" font-size="18"
        fill="${this.colors.dayLabel}" text-anchor="middle">${this.dayNames[d]}</text>`;
    }

    const firstDayOfWeek = this.getDayOfWeek(this.year, month, 1);
    const daysInMonth = this.getDaysInMonth(month, this.year);

    let dayCounter = 1;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (row === 0 && col < firstDayOfWeek) continue;
        if (dayCounter > daysInMonth) break;

        const centerX = gridStartX + (col * cellWidth) + (cellWidth / 2);
        const centerY = gridStartY + (row * cellHeight) + (cellHeight / 2);
        const completed = this.isCompleted(this.year, month, dayCounter);

        if (completed) {
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${dayRadius}"
            fill="${this.colors.completedDay}" stroke="none"/>`;
          svg += `<text x="${centerX}" y="${centerY + 1}"
            font-family="Arial, sans-serif" font-size="16"
            fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${dayCounter}</text>`;
        } else {
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${dayRadius}"
            fill="${this.colors.availableDay}" stroke="${this.colors.availableDayStroke}" stroke-width="2"/>`;
          svg += `<text x="${centerX}" y="${centerY + 1}"
            font-family="Arial, sans-serif" font-size="16"
            fill="${this.colors.text}" text-anchor="middle" dominant-baseline="middle">${dayCounter}</text>`;
        }
        dayCounter++;
      }
    }
    return svg;
  }

  generateLaptopSVG() {
    const padding = 80;
    const titleHeight = 150;
    const availableWidth = this.width - (2 * padding);
    const availableHeight = this.height - (2 * padding) - titleHeight;
    const cols = 4, rows = 3;
    const monthWidth = availableWidth / cols;
    const monthHeight = availableHeight / rows;

    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.background}"/>`;
    svg += `<text x="${this.width / 2}" y="${padding + 80}"
      font-family="Arial, sans-serif" font-size="80" font-weight="bold"
      fill="${this.colors.text}" text-anchor="middle">${this.year}</text>`;

    for (let month = 0; month < 12; month++) {
      const col = month % cols;
      const row = Math.floor(month / cols);
      const x = padding + (col * monthWidth);
      const y = padding + titleHeight + (row * monthHeight);
      svg += this.generateMonthSVG(month, x, y, monthWidth, monthHeight);
    }
    svg += '</svg>';
    return svg;
  }

  generateMobileSVG() {
    const padding = 60;
    const titleHeight = 150;
    const availableWidth = this.width - (2 * padding);
    const availableHeight = this.height - (2 * padding) - titleHeight;
    const cols = 2, rows = 6;
    const monthWidth = availableWidth / cols;
    const monthHeight = availableHeight / rows;

    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.background}"/>`;
    svg += `<text x="${this.width / 2}" y="${padding + 80}"
      font-family="Arial, sans-serif" font-size="80" font-weight="bold"
      fill="${this.colors.text}" text-anchor="middle">${this.year}</text>`;

    for (let month = 0; month < 12; month++) {
      const col = month % cols;
      const row = Math.floor(month / cols);
      const x = padding + (col * monthWidth);
      const y = padding + titleHeight + (row * monthHeight);
      svg += this.generateMonthSVG(month, x, y, monthWidth, monthHeight);
    }
    svg += '</svg>';
    return svg;
  }

  async generate() {
    const svg = this.device === 'mobile' ? this.generateMobileSVG() : this.generateLaptopSVG();
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return buffer;
  }
}

/**
 * Parse completed days from query parameter
 */
function parseCompletedDays(completedParam) {
  if (!completedParam) return [];
  return completedParam.split(',').map(item => item.trim()).filter(item => item);
}

/**
 * Vercel serverless function for calendar generation
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const device = req.query.device || 'laptop';
    const completedDays = parseCompletedDays(req.query.completed);

    if (year < 1900 || year > 2100) {
      return res.status(400).json({
        error: 'Invalid year. Please provide a year between 1900 and 2100.'
      });
    }

    if (device !== 'laptop' && device !== 'mobile') {
      return res.status(400).json({
        error: 'Invalid device. Please use "laptop" or "mobile".'
      });
    }

    const generator = new CalendarGenerator(year, device, completedDays);
    const buffer = await generator.generate();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="calendar-${year}-${device}.png"`);
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    res.send(buffer);

  } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(500).json({
      error: 'Failed to generate calendar',
      message: error.message
    });
  }
};
