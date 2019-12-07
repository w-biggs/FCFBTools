const childProcess = require('child_process');
const readline = require('readline');

const PN = childProcess.spawn('node', ['./updatePN.js']);
const wPN = childProcess.spawn('node', ['./updateWPN.js']);

let PNData = '';
let wPNData = '';

const writeData = function writeDataToConsole() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`PN ${PNData} · wPN ${wPNData}`);
};

PN.stdout.on('data', (data) => {
  PNData = data;
  writeData();
});

PN.stderr.on('data', (data) => {
  PNData = data;
  writeData();
});

wPN.stdout.on('data', (data) => {
  wPNData = data;
  writeData();
});

wPN.stderr.on('data', (data) => {
  wPNData = data;
  writeData();
});

process.on('exit', () => {
  process.stdout.write('\n');
});
