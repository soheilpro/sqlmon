const readline = require('readline');

async function wait(milliseconds, message) {
  return new Promise(resolve => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('keypress', (_, key) => {
      if (key.name === 'c' && !key.ctrl && !key.meta && !key.shift)
        end();
    });

    console.log(message);

    const timer = setTimeout(end, milliseconds);

    function end() {
      clearTimeout(timer);
      process.stdin.pause();
      process.stdin.setRawMode(false);
      resolve();
    }
  });
}

module.exports = wait;
