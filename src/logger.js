const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const path = require('path');

const GeneralHelpers = require('./general_helpers.js')

GeneralHelpers.mkdirp('log')

const myFormat = printf(info => {
  return `${new Date()} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'info',
  format: myFormat,
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: GeneralHelpers.localJoin('log/error.log'), level: 'error' }),
    new transports.File({ filename: GeneralHelpers.localJoin('log/combined.log') })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: myFormat
  }));
}

module.exports = logger;
