#!/usr/bin/env node
/**
 * Node.js client example for the Yearly Calendar Generator API
 * Run with: node client.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const { URL } = require('url');

class CalendarClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a calendar image
   */
  async generateCalendar(options = {}) {
    const {
      year = new Date().getFullYear(),
      device = 'laptop',
      completedDays = [],
      outputFile = `calendar-${year}-${device}.png`
    } = options;

    // Build URL
    let url = `${this.baseUrl}/calendar/generate?year=${year}&device=${device}`;

    if (completedDays.length > 0) {
      const completed = completedDays.join(',');
      url += `&completed=${encodeURIComponent(completed)}`;
    }

    console.log(`Generating calendar: ${year} (${device})`);
    if (completedDays.length > 0) {
      console.log(`Completed days: ${completedDays.length}`);
    }

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const request = client.get(url, (response) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(outputFile);

          response.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`✅ Calendar saved to: ${outputFile}`);
            resolve(outputFile);
          });

          fileStream.on('error', (err) => {
            fs.unlink(outputFile, () => {});
            reject(err);
          });
        } else {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            console.log(`❌ Error: ${data}`);
            reject(new Error(data));
          });
        }
      });

      request.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Check if the API is running
   */
  async checkHealth() {
    return new Promise((resolve) => {
      const parsedUrl = new URL(`${this.baseUrl}/health`);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const request = client.get(`${this.baseUrl}/health`, (response) => {
        if (response.statusCode === 200) {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            const json = JSON.parse(data);
            console.log(`✅ API is healthy (timestamp: ${json.timestamp})`);
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });

      request.on('error', () => {
        console.log(`❌ Cannot connect to API at ${this.baseUrl}`);
        resolve(false);
      });
    });
  }
}

/**
 * Example usage
 */
async function main() {
  const client = new CalendarClient('http://localhost:3000');

  // Check if API is running
  const isHealthy = await client.checkHealth();
  if (!isHealthy) {
    console.log('\nMake sure the server is running:');
    console.log('  npm start');
    process.exit(1);
  }

  try {
    console.log('\n' + '='.repeat(50));
    console.log('Example 1: Basic laptop calendar');
    console.log('='.repeat(50));
    await client.generateCalendar({
      year: 2024,
      device: 'laptop',
      outputFile: 'example1-laptop.png'
    });

    console.log('\n' + '='.repeat(50));
    console.log('Example 2: Mobile calendar with date strings');
    console.log('='.repeat(50));
    await client.generateCalendar({
      year: 2024,
      device: 'mobile',
      completedDays: [
        '2024-01-01', '2024-01-15', '2024-02-14',
        '2024-04-01', '2024-07-04', '2024-12-25'
      ],
      outputFile: 'example2-mobile-dates.png'
    });

    console.log('\n' + '='.repeat(50));
    console.log('Example 3: Laptop calendar with day numbers');
    console.log('='.repeat(50));
    await client.generateCalendar({
      year: 2024,
      device: 'laptop',
      completedDays: [1, 15, 30, 45, 60, 75, 90, 100, 150, 200, 250, 300, 350],
      outputFile: 'example3-laptop-numbers.png'
    });

    console.log('\n✅ All examples completed!');
    console.log('Check the current directory for the generated images.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CalendarClient;
