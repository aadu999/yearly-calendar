const sharp = require('sharp');

/**
 * Generates a minimalist yearly calendar image using SVG + Sharp
 */
class CalendarGenerator {
  constructor(year, device = 'laptop', completedDays = []) {
    this.year = year;
    this.device = device;
    this.completedDays = new Set(completedDays);

    // 4K resolutions
    if (device === 'mobile') {
      this.width = 2160;
      this.height = 3840;
    } else {
      this.width = 3840;
      this.height = 2160;
    }

    // Color scheme - minimalist design
    this.colors = {
      background: '#FFFFFF',
      text: '#2C3E50',
      availableDay: '#E8E8E8',
      availableDayStroke: '#CCCCCC',
      completedDay: '#3498DB',
      monthLabel: '#2C3E50',
      dayLabel: '#7F8C8D',
      gridLine: '#F0F0F0'
    };

    // Month names
    this.monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Day abbreviations
    this.dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }

  /**
   * Check if a year is a leap year
   */
  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Get number of days in a month
   */
  getDaysInMonth(month, year) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 1 && this.isLeapYear(year)) {
      return 29;
    }
    return daysInMonth[month];
  }

  /**
   * Get the day of week (0 = Monday, 6 = Sunday)
   */
  getDayOfWeek(year, month, day) {
    const date = new Date(year, month, day);
    let dayOfWeek = date.getDay();
    // Convert Sunday (0) to 6, and shift others down
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return dayOfWeek;
  }

  /**
   * Check if a specific date is marked as completed
   */
  isCompleted(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfYear = this.getDayOfYear(year, month, day);
    return this.completedDays.has(dateStr) || this.completedDays.has(dayOfYear.toString());
  }

  /**
   * Get day number of the year (1-365/366)
   */
  getDayOfYear(year, month, day) {
    let dayOfYear = day;
    for (let m = 0; m < month; m++) {
      dayOfYear += this.getDaysInMonth(m, year);
    }
    return dayOfYear;
  }

  /**
   * Generate SVG for a single month
   */
  generateMonthSVG(month, x, y, width, height) {
    const monthPadding = 20;
    const monthNameHeight = 50;
    const dayLabelHeight = 30;

    let svg = '';

    // Month name
    svg += `<text x="${x + width / 2}" y="${y + monthNameHeight}"
      font-family="Arial, sans-serif" font-size="32" font-weight="bold"
      fill="${this.colors.monthLabel}" text-anchor="middle">${this.monthNames[month]}</text>`;

    // Calculate grid dimensions
    const gridWidth = width - (2 * monthPadding);
    const gridHeight = height - monthNameHeight - dayLabelHeight - (2 * monthPadding);
    const cellWidth = gridWidth / 7;
    const cellHeight = gridHeight / 6;
    const dayRadius = Math.min(cellWidth, cellHeight) / 3;

    const gridStartX = x + monthPadding;
    const gridStartY = y + monthNameHeight + dayLabelHeight + monthPadding;

    // Draw day labels (M T W T F S S)
    for (let d = 0; d < 7; d++) {
      const labelX = gridStartX + (d * cellWidth) + (cellWidth / 2);
      const labelY = y + monthNameHeight + dayLabelHeight - 5;
      svg += `<text x="${labelX}" y="${labelY}"
        font-family="Arial, sans-serif" font-size="18"
        fill="${this.colors.dayLabel}" text-anchor="middle">${this.dayNames[d]}</text>`;
    }

    // Get first day of month and total days
    const firstDayOfWeek = this.getDayOfWeek(this.year, month, 1);
    const daysInMonth = this.getDaysInMonth(month, this.year);

    // Draw days
    let dayCounter = 1;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        // Skip days before month starts
        if (row === 0 && col < firstDayOfWeek) continue;
        // Stop if we've drawn all days
        if (dayCounter > daysInMonth) break;

        const centerX = gridStartX + (col * cellWidth) + (cellWidth / 2);
        const centerY = gridStartY + (row * cellHeight) + (cellHeight / 2);

        const completed = this.isCompleted(this.year, month, dayCounter);

        // Draw day circle
        if (completed) {
          // Filled circle for completed days
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${dayRadius}"
            fill="${this.colors.completedDay}" stroke="none"/>`;
          svg += `<text x="${centerX}" y="${centerY + 1}"
            font-family="Arial, sans-serif" font-size="16"
            fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${dayCounter}</text>`;
        } else {
          // Outlined circle for available days
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

  /**
   * Generate complete SVG for laptop (landscape) layout
   */
  generateLaptopSVG() {
    const padding = 80;
    const titleHeight = 150;
    const availableWidth = this.width - (2 * padding);
    const availableHeight = this.height - (2 * padding) - titleHeight;

    // 4 columns x 3 rows for 12 months
    const cols = 4;
    const rows = 3;
    const monthWidth = availableWidth / cols;
    const monthHeight = availableHeight / rows;

    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

    // Background
    svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.background}"/>`;

    // Title
    svg += `<text x="${this.width / 2}" y="${padding + 80}"
      font-family="Arial, sans-serif" font-size="80" font-weight="bold"
      fill="${this.colors.text}" text-anchor="middle">${this.year}</text>`;

    // Draw each month
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

  /**
   * Generate complete SVG for mobile (portrait) layout
   */
  generateMobileSVG() {
    const padding = 60;
    const titleHeight = 150;
    const availableWidth = this.width - (2 * padding);
    const availableHeight = this.height - (2 * padding) - titleHeight;

    // 2 columns x 6 rows for 12 months (better for portrait)
    const cols = 2;
    const rows = 6;
    const monthWidth = availableWidth / cols;
    const monthHeight = availableHeight / rows;

    let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

    // Background
    svg += `<rect width="${this.width}" height="${this.height}" fill="${this.colors.background}"/>`;

    // Title
    svg += `<text x="${this.width / 2}" y="${padding + 80}"
      font-family="Arial, sans-serif" font-size="80" font-weight="bold"
      fill="${this.colors.text}" text-anchor="middle">${this.year}</text>`;

    // Draw each month
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

  /**
   * Generate the calendar image as PNG buffer
   */
  async generate() {
    const svg = this.device === 'mobile'
      ? this.generateMobileSVG()
      : this.generateLaptopSVG();

    // Convert SVG to PNG using Sharp
    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return buffer;
  }
}

module.exports = CalendarGenerator;
