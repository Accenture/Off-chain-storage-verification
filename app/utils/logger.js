const { createLogger, format, transports } = require('winston');
const { config } = require('../../package.json');

const { combine, timestamp, label, printf, colorize, align, splat } = format;

const loggsFormat = printf((info) => {
  const ts = info.timestamp.slice(0, 19).replace('T', ' ');
  return `${ts} ${info.level} ${info.label}: ${info.message}`;
});

const loggsFormat2 = printf((info) => {
  const ts = Math.round((new Date(info.timestamp)).getTime());
  return `${ts};${info.message}`;
});

const Logger = (fileName) => {
  let level = 'info';
  if (config.debug || process.env.DEBUG) {
    level = 'debug';
  }
  let file = "combined_nodes.log"
  const consoleLoger = new transports.Console({
    level,
    format: combine(
      colorize(),
      timestamp(),
      align(),
      label({ label: fileName }),
      splat(),
      loggsFormat,
    ),
  });
  const fileLoger = new transports.File({
    filename: file,
    level: 'warn',
    maxsize: 5242880, // 5 mb
    maxFiles: 10,
    format: combine(
      colorize(),
      timestamp(),
      label({ label: fileName }),
      splat(),
      loggsFormat2,
    ),
  });
  const transportsArray = [fileLoger];
  if (process.env.NODE_ENV !== 'test') {
    transportsArray.push(consoleLoger);
  }
  const logger = createLogger({
    transports: transportsArray,
  });
  return logger;
};

module.exports = Logger;

// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   verbose: 3,
//   debug: 4,
//   silly: 5
// }
