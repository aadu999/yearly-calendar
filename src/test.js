const fs = require('fs');
const path = require('path');
const CalendarGenerator = require('./calendarGenerator');

/**
 * Test script to generate sample calendars
 */
async function runTests() {
  console.log('🧪 Running Calendar Generator Tests...\n');

  // Create test output directory
  const outputDir = path.join(__dirname, '../test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Test 1: Laptop calendar with no completed days
    console.log('Test 1: Generating laptop calendar (2024) with no completed days...');
    const test1 = new CalendarGenerator(2024, 'laptop', []);
    const buffer1 = await test1.generate();
    fs.writeFileSync(
      path.join(outputDir, 'calendar-2024-laptop-empty.png'),
      buffer1
    );
    console.log('✅ Saved: test-output/calendar-2024-laptop-empty.png');
    console.log(`   Resolution: ${test1.width}x${test1.height}\n`);

    // Test 2: Mobile calendar with no completed days
    console.log('Test 2: Generating mobile calendar (2024) with no completed days...');
    const test2 = new CalendarGenerator(2024, 'mobile', []);
    const buffer2 = await test2.generate();
    fs.writeFileSync(
      path.join(outputDir, 'calendar-2024-mobile-empty.png'),
      buffer2
    );
    console.log('✅ Saved: test-output/calendar-2024-mobile-empty.png');
    console.log(`   Resolution: ${test2.width}x${test2.height}\n`);

    // Test 3: Laptop calendar with some completed days (date format)
    console.log('Test 3: Generating laptop calendar with completed days (date format)...');
    const completedDates = [
      '2024-01-01', '2024-01-15', '2024-02-14', '2024-03-17',
      '2024-04-01', '2024-05-20', '2024-06-15', '2024-07-04',
      '2024-08-10', '2024-09-05', '2024-10-31', '2024-12-25'
    ];
    const test3 = new CalendarGenerator(2024, 'laptop', completedDates);
    const buffer3 = await test3.generate();
    fs.writeFileSync(
      path.join(outputDir, 'calendar-2024-laptop-completed.png'),
      buffer3
    );
    console.log('✅ Saved: test-output/calendar-2024-laptop-completed.png');
    console.log(`   Completed days: ${completedDates.length}\n`);

    // Test 4: Mobile calendar with day numbers
    console.log('Test 4: Generating mobile calendar with completed days (day numbers)...');
    const completedDayNumbers = ['1', '15', '30', '45', '60', '75', '90', '100', '150', '200', '250', '300', '350'];
    const test4 = new CalendarGenerator(2024, 'mobile', completedDayNumbers);
    const buffer4 = await test4.generate();
    fs.writeFileSync(
      path.join(outputDir, 'calendar-2024-mobile-completed.png'),
      buffer4
    );
    console.log('✅ Saved: test-output/calendar-2024-mobile-completed.png');
    console.log(`   Completed days: ${completedDayNumbers.length}\n`);

    // Test 5: Leap year test (2024)
    console.log('Test 5: Testing leap year (2024)...');
    const leapYear = test1.isLeapYear(2024);
    const febDays = test1.getDaysInMonth(1, 2024);
    console.log(`✅ 2024 is leap year: ${leapYear}`);
    console.log(`   February has ${febDays} days\n`);

    // Test 6: Non-leap year test (2025)
    console.log('Test 6: Generating calendar for non-leap year (2025)...');
    const test6 = new CalendarGenerator(2025, 'laptop', []);
    const buffer6 = await test6.generate();
    fs.writeFileSync(
      path.join(outputDir, 'calendar-2025-laptop.png'),
      buffer6
    );
    console.log('✅ Saved: test-output/calendar-2025-laptop.png\n');

    console.log('🎉 All tests completed successfully!');
    console.log(`📁 Check the test-output directory for generated images.`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run tests
runTests().catch(console.error);
