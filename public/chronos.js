/**
 * Chronos 4K - Improved Year Progress Visualization
 * With better alignment and layout calculations
 */

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

const DAYS_HEADER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

class ChronosApp {
  constructor() {
    this.config = {
      themeKey: 'cyber',
      shape: 'rounded',
      layout: 'mobile'
    };

    this.today = new Date();
    this.year = this.today.getFullYear();
    this.startOfYear = new Date(this.year, 0, 1);
    this.dayOfYear = Math.floor((this.today - this.startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = (this.year % 400 === 0 || (this.year % 100 !== 0 && this.year % 4 === 0)) ? 366 : 365;
    this.remainingDays = this.totalDays - this.dayOfYear;
    this.progressPercent = this.dayOfYear / this.totalDays;
    this.currentDayOfWeek = this.today.getDay();
    this.quote = QUOTES[this.dayOfYear % QUOTES.length];

    this.isGenerating = false;

    this.init();
  }

  init() {
    this.checkURLParams();
    this.renderUI();
    this.attachEventListeners();
  }

  checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('device')) {
      this.config.layout = params.get('device');
    }
    if (params.has('theme')) {
      this.config.themeKey = params.get('theme');
    }
    if (params.has('shape')) {
      this.config.shape = params.get('shape');
    }
    if (params.has('auto') && params.get('auto') === 'true') {
      setTimeout(() => this.downloadWallpaper(), 1500);
    }
  }

  getLayoutZones(isMobile) {
    const p = 0.05;
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

  renderUI() {
    const theme = THEMES[this.config.themeKey];
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;

    const html = `
      <div class="h-screen w-screen flex flex-col lg:flex-row overflow-hidden" style="background-color: ${theme.bg}; color: ${theme.text}">

        <!-- Sidebar -->
        <div class="w-full lg:w-80 border-r border-white/10 flex flex-col z-20 bg-black/20 backdrop-blur-md shadow-2xl lg:h-full order-2 lg:order-1 max-h-[40vh] lg:max-h-full overflow-y-auto">
          <div class="p-5 border-b border-white/5 bg-white/5">
            <h1 class="text-xl font-bold tracking-tight flex items-center gap-2">
              <span style="color: ${theme.accent}">⚡</span>
              <span>CHRONOS 4K</span>
            </h1>
          </div>

          <div class="p-5 space-y-6 flex-1">
            <!-- Theme -->
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest opacity-50 font-bold">🎨 Aesthetics</label>
              <div class="grid grid-cols-4 gap-2" id="themeGrid">
                ${Object.entries(THEMES).map(([key, t]) => `
                  <button
                    data-theme="${key}"
                    class="aspect-square rounded-lg border flex items-center justify-center transition-transform hover:scale-105 ${this.config.themeKey === key ? 'ring-2 ring-offset-1' : 'opacity-60'}"
                    style="background-color: ${t.bg}; border-color: ${t.secondary}; ${this.config.themeKey === key ? `outline: 2px solid ${t.accent}` : ''}"
                  >
                    <div class="w-2 h-2 rounded-full shadow-lg" style="background: ${t.accent}"></div>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Shape -->
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest opacity-50 font-bold">⚙️ Geometry</label>
              <div class="flex bg-white/5 p-1 rounded-lg">
                ${['square', 'rounded', 'circle'].map(s => `
                  <button
                    data-shape="${s}"
                    class="flex-1 py-2 flex justify-center rounded transition-colors ${this.config.shape === s ? 'bg-white/10 text-white' : 'text-white/30'}"
                  >
                    ${s === 'square' ? '▪' : s === 'rounded' ? '▫' : '●'}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Layout -->
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest opacity-50 font-bold">💻 Device Target</label>
              <div class="grid grid-cols-2 gap-3">
                ${['desktop', 'mobile'].map(l => `
                  <button
                    data-layout="${l}"
                    class="p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${this.config.layout === l ? 'bg-white/10 border-white/30 text-white' : 'border-transparent bg-white/5 text-white/40'}"
                  >
                    <span>${l === 'desktop' ? '🖥️' : '📱'}</span>
                    <span class="text-[10px] font-medium uppercase">${l}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="p-5 border-t border-white/5 bg-white/5">
            <button
              id="downloadBtn"
              class="w-full h-12 font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
              style="background-color: ${theme.accent}; color: ${this.config.themeKey === 'swiss' ? 'white' : 'black'}"
            >
              <span>${this.isGenerating ? '↻' : '⬇'}</span>
              <span>DOWNLOAD 4K PNG</span>
            </button>
          </div>
        </div>

        <!-- Preview -->
        <div class="flex-1 order-1 lg:order-2 flex items-center justify-center p-4 relative overflow-hidden" style="background-image: url('data:image/svg+xml;utf8,<svg width=\\"20\\" height=\\"20\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect width=\\"10\\" height=\\"10\\" fill=\\"rgba(255,255,255,0.02)\\"/><rect x=\\"10\\" y=\\"10\\" width=\\"10\\" height=\\"10\\" fill=\\"rgba(255,255,255,0.02)\\"/></svg>')">
          <div
            id="previewCard"
            class="relative shadow-2xl transition-all duration-500 ease-out ring-1 ring-white/10"
            style="
              background-color: ${theme.bg};
              aspect-ratio: ${this.config.layout === 'mobile' ? '9/16' : '16/9'};
              ${this.config.layout === 'mobile' ? 'height: 95%; width: auto;' : 'width: 90%; height: auto;'}
              border-radius: 20px;
            "
          >
            ${this.renderPreview()}
          </div>
        </div>
      </div>
    `;

    document.getElementById('root').innerHTML = html;
  }

  renderPreview() {
    const theme = THEMES[this.config.themeKey];
    const isMobile = this.config.layout === 'mobile';
    const zones = this.getLayoutZones(isMobile);

    return `
      <!-- Date Zone -->
      <div style="
        position: absolute;
        left: ${zones.date.left * 100}%;
        top: ${zones.date.top * 100}%;
        width: ${zones.date.width * 100}%;
        height: ${zones.date.height * 100}%;
      ">
        <div class="flex flex-row items-baseline gap-2">
          <span class="font-bold leading-none" style="font-size: ${isMobile ? '5vh' : '6vw'};">
            ${this.today.getDate().toString().padStart(2, '0')}
          </span>
          <div class="flex flex-col leading-tight" style="font-size: ${isMobile ? '1.2vh' : '1.5vw'};">
            <span style="color: ${theme.accent}; font-weight: 600;">
              ${this.today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}
            </span>
            <span style="color: ${theme.secondary};">${this.year}</span>
          </div>
        </div>

        ${isMobile ? this.renderMobileProgress(theme) : this.renderDesktopProgress(theme)}
      </div>

      <!-- Grid Zone -->
      <div style="
        position: absolute;
        left: ${zones.grid.left * 100}%;
        top: ${zones.grid.top * 100}%;
        width: ${zones.grid.width * 100}%;
        height: ${zones.grid.height * 100}%;
        display: flex;
        flex-direction: ${isMobile ? 'column' : 'row'};
      ">
        ${this.renderGrid(theme, isMobile)}
      </div>
    `;
  }

  renderMobileProgress(theme) {
    return `
      <div class="flex flex-col gap-2 mt-4 w-full">
        <div class="w-full h-1.5 rounded-full overflow-hidden" style="background-color: ${theme.muted}">
          <div class="h-full transition-all" style="width: ${this.progressPercent * 100}%; background-color: ${theme.accent}"></div>
        </div>
        <div class="flex justify-between text-[1.2vh] font-bold" style="color: ${theme.secondary}">
          <span>${this.dayOfYear} FINISHED</span>
          <span>${this.remainingDays} REMAINING</span>
        </div>
        <div class="mt-2 italic font-light opacity-60 text-[1.4vh]" style="color: ${theme.text}">
          "${this.quote}"
        </div>
      </div>
    `;
  }

  renderDesktopProgress(theme) {
    return `
      <div class="mt-8 flex flex-col gap-4 w-full">
        <div class="w-full h-4 rounded-full overflow-hidden" style="background-color: ${theme.muted}">
          <div class="h-full transition-all" style="width: ${this.progressPercent * 100}%; background-color: ${theme.accent}"></div>
        </div>
        <div class="flex justify-between items-start">
          <div class="flex flex-col items-start">
            <span class="text-5xl font-bold" style="color: ${theme.text}">${this.dayOfYear}</span>
            <span class="text-sm font-medium tracking-wide" style="color: ${theme.secondary}">FINISHED</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-5xl font-bold" style="color: ${theme.text}">${this.remainingDays}</span>
            <span class="text-sm font-medium tracking-wide" style="color: ${theme.secondary}">REMAINING</span>
          </div>
        </div>
        <div class="relative mt-8">
          <span class="text-6xl font-serif opacity-30 absolute -top-4 -left-2" style="color: ${theme.muted}">"</span>
          <p class="pl-6 italic font-light opacity-70 text-lg leading-relaxed" style="color: ${theme.text}">
            ${this.quote}
          </p>
        </div>
      </div>
    `;
  }

  renderGrid(theme, isMobile) {
    const firstDayIndex = new Date(this.year, 0, 1).getDay();
    const gridHTML = [];

    // Labels
    const labelStyle = isMobile
      ? `display: flex; flex-direction: row; width: 100%; height: 4%; justify-content: space-between;`
      : `display: flex; flex-direction: column; height: 100%; width: 3%; justify-content: space-between;`;

    gridHTML.push(`<div style="${labelStyle}">`);
    DAYS_HEADER.forEach((d, i) => {
      const color = i === this.currentDayOfWeek ? theme.accent : theme.secondary;
      gridHTML.push(`
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: ${color};
          font-size: ${isMobile ? '1.5vh' : '1vw'};
        ">${d}</div>
      `);
    });
    gridHTML.push('</div>');

    // Grid cells
    const gridStyle = `
      flex: 1;
      width: 100%;
      height: 100%;
      display: grid;
      gap: 0.2%;
      grid-template-columns: repeat(${isMobile ? '7' : '53'}, 1fr);
      grid-template-rows: repeat(${isMobile ? '53' : '7'}, 1fr);
    `;

    gridHTML.push(`<div style="${gridStyle}">`);

    for (let i = 0; i < 371; i++) {
      let c, r;
      if (isMobile) {
        c = i % 7;
        r = Math.floor(i / 7);
      } else {
        r = i % 7;
        c = Math.floor(i / 7);
      }

      const dIndex = isMobile ? (r * 7) + c - firstDayIndex : (c * 7) + r - firstDayIndex;

      if (dIndex < 0 || dIndex >= this.totalDays) {
        gridHTML.push('<div></div>');
        continue;
      }

      const isPast = dIndex < (this.dayOfYear - 1);
      const isToday = dIndex === (this.dayOfYear - 1);

      const bg = isToday ? theme.accent : (isPast ? theme.secondary : theme.muted);
      const borderRadius = this.config.shape === 'circle' ? '50%' : this.config.shape === 'rounded' ? '30%' : '0';
      const shadow = isToday ? `0 0 10px ${theme.accent}` : 'none';

      gridHTML.push(`
        <div style="
          background-color: ${bg};
          border-radius: ${borderRadius};
          box-shadow: ${shadow};
          transition: all 0.3s;
        "></div>
      `);
    }

    gridHTML.push('</div>');

    return gridHTML.join('');
  }

  attachEventListeners() {
    // Theme buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.config.themeKey = e.currentTarget.dataset.theme;
        this.renderUI();
        this.attachEventListeners();
      });
    });

    // Shape buttons
    document.querySelectorAll('[data-shape]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.config.shape = e.currentTarget.dataset.shape;
        this.renderUI();
        this.attachEventListeners();
      });
    });

    // Layout buttons
    document.querySelectorAll('[data-layout]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.config.layout = e.currentTarget.dataset.layout;
        this.renderUI();
        this.attachEventListeners();
      });
    });

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
      this.downloadWallpaper();
    });
  }

  downloadWallpaper() {
    this.isGenerating = true;
    this.renderUI();
    this.attachEventListeners();

    const w = this.config.layout === 'desktop' ? 3840 : 2160;
    const h = this.config.layout === 'desktop' ? 2160 : 3840;

    setTimeout(() => {
      const canvas = document.getElementById('exportCanvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      this.drawCanvas(ctx, w, h);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chronos-${this.config.layout}-${this.year}.png`;
        a.click();
        URL.revokeObjectURL(url);

        this.isGenerating = false;
        this.renderUI();
        this.attachEventListeners();
      });
    }, 50);
  }

  drawCanvas(ctx, w, h) {
    const theme = THEMES[this.config.themeKey];
    const isMobile = this.config.layout === 'mobile';
    const zones = this.getLayoutZones(isMobile);

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);

    // Draw date zone and grid zone
    this.drawDateZone(ctx, w, h, zones.date, theme, isMobile);
    this.drawGridZone(ctx, w, h, zones.grid, theme, isMobile);
  }

  drawDateZone(ctx, w, h, zone, theme, isMobile) {
    const x = w * zone.left;
    const y = h * zone.top;
    const zw = w * zone.width;
    const zh = h * zone.height;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Date number
    const dateSize = isMobile ? zh * 0.5 : zw * 0.4;
    ctx.font = `bold ${dateSize}px Inter, sans-serif`;
    ctx.fillStyle = theme.text;
    ctx.fillText(this.today.getDate().toString().padStart(2, '0'), x, y);

    // Month/Year
    const dayWidth = ctx.measureText(this.today.getDate().toString().padStart(2, '0')).width;
    const metaX = x + dayWidth + (w * 0.015);
    const metaY = y + (dateSize * 0.18);
    const metaSize = dateSize * 0.25;

    ctx.font = `600 ${metaSize}px Inter, sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(this.today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase(), metaX, metaY);

    ctx.font = `400 ${metaSize}px Inter, sans-serif`;
    ctx.fillStyle = theme.secondary;
    ctx.fillText(this.year, metaX, metaY + metaSize * 1.2);

    // Progress bar and stats
    if (isMobile) {
      this.drawMobileProgress(ctx, x, metaY + (metaSize * 2.8), zw, metaSize, theme);
    } else {
      this.drawDesktopProgress(ctx, x, y + dateSize + (zh * 0.05), zw, zh, metaSize, theme);
    }
  }

  drawMobileProgress(ctx, x, barY, barW, metaSize, theme) {
    const barH = metaSize * 0.3;

    // Background bar
    ctx.fillStyle = theme.muted;
    ctx.beginPath();
    ctx.roundRect(x, barY, barW, barH, barH);
    ctx.fill();

    // Progress bar
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.roundRect(x, barY, barW * this.progressPercent, barH, barH);
    ctx.fill();

    // Labels
    const labelY = barY + barH + (metaSize * 0.5);
    ctx.font = `bold ${metaSize * 0.7}px Inter, sans-serif`;

    ctx.textAlign = 'left';
    ctx.fillStyle = theme.secondary;
    ctx.fillText(`${this.dayOfYear} FINISHED`, x, labelY);

    ctx.textAlign = 'right';
    ctx.fillText(`${this.remainingDays} REMAINING`, x + barW, labelY);

    // Quote
    const quoteY = labelY + (metaSize * 1.2);
    ctx.globalAlpha = 0.6;
    ctx.textAlign = 'left';
    ctx.fillStyle = theme.text;
    ctx.font = `italic 300 ${metaSize * 0.6}px Inter, sans-serif`;
    this.wrapText(ctx, `"${this.quote}"`, x, quoteY, barW, metaSize * 0.8);
    ctx.globalAlpha = 1;
  }

  drawDesktopProgress(ctx, x, startY, barW, zh, metaSize, theme) {
    const barH = barW * 0.06;

    // Background bar
    ctx.fillStyle = theme.muted;
    ctx.beginPath();
    ctx.roundRect(x, startY, barW, barH, barH);
    ctx.fill();

    // Progress bar
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.roundRect(x, startY, barW * this.progressPercent, barH, barH);
    ctx.fill();

    // Stats
    const numY = startY + barH + (barW * 0.08);
    const statNumSize = barW * 0.12;
    const statLabelSize = barW * 0.04;

    ctx.textAlign = 'left';
    ctx.fillStyle = theme.text;
    ctx.font = `bold ${statNumSize}px Inter, sans-serif`;
    ctx.fillText(`${this.dayOfYear}`, x, numY);

    ctx.fillStyle = theme.secondary;
    ctx.font = `${statLabelSize}px Inter, sans-serif`;
    ctx.fillText('FINISHED', x, numY + statNumSize + (statLabelSize * 0.5));

    ctx.textAlign = 'right';
    ctx.fillStyle = theme.text;
    ctx.font = `bold ${statNumSize}px Inter, sans-serif`;
    ctx.fillText(`${this.remainingDays}`, x + barW, numY);

    ctx.fillStyle = theme.secondary;
    ctx.font = `${statLabelSize}px Inter, sans-serif`;
    ctx.fillText('REMAINING', x + barW, numY + statNumSize + (statLabelSize * 0.5));

    // Quote
    const quoteY = numY + statNumSize + statLabelSize + (zh * 0.08);
    ctx.textAlign = 'left';
    ctx.fillStyle = theme.muted;
    ctx.font = `bold ${barW * 0.2}px serif`;
    ctx.fillText('"', x, quoteY);

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = theme.text;
    ctx.font = `italic 300 ${barW * 0.065}px Inter, sans-serif`;
    this.wrapText(ctx, this.quote, x + (barW * 0.12), quoteY + (barW * 0.1), barW * 0.88, barW * 0.09);
    ctx.globalAlpha = 1;
  }

  drawGridZone(ctx, w, h, zone, theme, isMobile) {
    const gx = w * zone.left;
    const gy = h * zone.top;
    let gw = w * zone.width;
    let gh = h * zone.height;

    const labelSize = isMobile ? gh * 0.04 : gw * 0.03;

    // Draw labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelFont = `bold ${labelSize * 0.5}px Inter, sans-serif`;

    let gridX = gx, gridY = gy, gridW = gw, gridH = gh;

    if (isMobile) {
      gridY += labelSize;
      gridH -= labelSize;
      const colW = gridW / 7;
      DAYS_HEADER.forEach((day, i) => {
        ctx.fillStyle = (i === this.currentDayOfWeek) ? theme.accent : theme.secondary;
        ctx.font = labelFont;
        ctx.fillText(day, gx + (i * colW) + (colW/2), gy + (labelSize/2));
      });
    } else {
      gridX += labelSize;
      gridW -= labelSize;
      const rowH = gridH / 7;
      DAYS_HEADER.forEach((day, i) => {
        ctx.fillStyle = (i === this.currentDayOfWeek) ? theme.accent : theme.secondary;
        ctx.font = labelFont;
        ctx.fillText(day, gx + (labelSize/2), gridY + (i * rowH) + (rowH/2));
      });
    }

    // Draw grid
    const cols = isMobile ? 7 : 53;
    const rows = isMobile ? 53 : 7;
    const gap = w * 0.002;

    const cellW = (gridW - ((cols - 1) * gap)) / cols;
    const cellH = (gridH - ((rows - 1) * gap)) / rows;

    const firstDayIndex = new Date(this.year, 0, 1).getDay();

    for (let i = 0; i < cols * rows; i++) {
      let c, r;
      if (isMobile) {
        c = i % 7;
        r = Math.floor(i / 7);
      } else {
        r = i % 7;
        c = Math.floor(i / 7);
      }

      const dIndex = isMobile ? (r * 7) + c - firstDayIndex : (c * 7) + r - firstDayIndex;

      if (dIndex < 0 || dIndex >= this.totalDays) continue;

      const x = gridX + c * (cellW + gap);
      const y = gridY + r * (cellH + gap);

      const isPast = dIndex < (this.dayOfYear - 1);
      const isToday = dIndex === (this.dayOfYear - 1);

      let fill = theme.muted;
      if (isPast) fill = theme.secondary;
      if (isToday) fill = theme.accent;

      ctx.fillStyle = fill;

      if (this.config.shape === 'circle') {
        const rad = Math.min(cellW, cellH) / 2;
        ctx.beginPath();
        ctx.arc(x + cellW/2, y + cellH/2, rad, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.config.shape === 'rounded') {
        const rad = Math.min(cellW, cellH) * 0.3;
        ctx.beginPath();
        ctx.roundRect(x, y, cellW, cellH, rad);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, cellW, cellH);
      }

      if (isToday) {
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = Math.min(cellW, cellH) * 2;

        if (this.config.shape === 'circle') {
          const rad = Math.min(cellW, cellH) / 2;
          ctx.beginPath();
          ctx.arc(x + cellW/2, y + cellH/2, rad, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.config.shape === 'rounded') {
          const rad = Math.min(cellW, cellH) * 0.3;
          ctx.beginPath();
          ctx.roundRect(x, y, cellW, cellH, rad);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, cellW, cellH);
        }

        ctx.shadowBlur = 0;
      }
    }
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ChronosApp());
} else {
  new ChronosApp();
}
