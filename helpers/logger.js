const fs = require('fs');
const { ERROR_LOG_PATH, MESSAGE_LOG_PATH } = require('../config');

function clearLogs() {
    fs.truncate(ERROR_LOG_PATH, 0, () => {});
    fs.truncate(MESSAGE_LOG_PATH, 0, () => {});
}

function logError(error) {
    console.error(error);
    fs.appendFile(
        ERROR_LOG_PATH,
        `${new Date().toISOString()}: ${error}\n`,
        err => {
            if(err) console.error(`Unable to write to error log file : ${err}`);
        }
    );
}

function logMessage(message) {
    console.log(message);
    fs.appendFile(
        MESSAGE_LOG_PATH,
        `${new Date().toISOString()}: ${message}\n`,
        err => {
            if(err) console.error(`Unable to write to message log file : ${err}`);
        }
    )
}

module.exports = {
    logError,
    logMessage,
    clearLogs
}