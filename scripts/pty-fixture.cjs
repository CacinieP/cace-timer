// Test-only launcher: never reads/writes the user's real timer file.
const fs = require('node:fs');
const path = require('node:path');
const blessed = require('blessed');
const root = path.resolve(__dirname, '..');
const data = require('../dist/data');
data.setDataFile(process.env.CACE_TEST_DATA);
const { configureDisplay } = require('../dist/terminal');
configureDisplay({ color: '256', ascii: false, animation: true, tui: true });
require('../dist/i18n').setLocale('en');
const mode = process.argv[2];
const createScreen = blessed.screen;
let captured = 0;
blessed.screen = function (options) {
  const screen = createScreen(options);
  const render = screen.render;
  screen.render = function () {
    const result = render.apply(this, arguments);
    if (mode === 'render-error') throw new Error('injected render failure');
    if (process.env.CACE_TEST_CAPTURE) {
      const snapshot = screen.screenshot(0, Number(screen.width), 0, Number(screen.height));
      const dest = process.env.CACE_TEST_CAPTURE;
      fs.writeFileSync(dest, snapshot);
      fs.writeFileSync(dest + '.json', JSON.stringify({ columns: Number(screen.width), rows: Number(screen.height), renders: ++captured }));
    }
    return result;
  };
  return screen;
};

(async () => {
  if (mode === 'cli') {
    process.argv = [process.execPath, path.join(root, 'dist/index.js'), ...process.argv.slice(3)];
    require('../dist/index');
    return;
  }
  if (mode === 'preview') await require('../dist/commands/mascot').cmdMascot({});
  else if (mode === 'dashboard') await require('../dist/tui/dashboard').showDashboard();
  else if (mode === 'reflection') await require('../dist/tui/reflection').showReflectionInput();
  else {
    const short = mode === 'complete';
    await require('../dist/commands/pomodoro').cmdPomodoro('Fixture task', { work: short ? 0.005 : 1, rounds: 1 });
  }
  const record = data.loadData();
  console.log('RESULT ' + JSON.stringify({ history: record.history.length, active: !!record.current }));
})().catch(error => {
  console.error(error.message);
  const record = data.loadData();
  console.log('RESULT ' + JSON.stringify({ history: record.history.length, active: !!record.current }));
  process.exitCode = 1;
});
