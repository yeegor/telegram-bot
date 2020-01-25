const fs = require('fs');
const { ERROR_LOG_PATH, MESSAGE_LOG_PATH } = require('../config');

function logError(error) {
    console.error(error);
    fs.appendFile(
        ERROR_LOG_PATH,
        `${new Date().toISOString()}: ${error}\n`,
        () => console.error('Unable to write to log file')
    );
}

function logMessage(message) {
    console.log(message);
    fs.appendFile(
        MESSAGE_LOG_PATH,
        `${new Date().toISOString()}: ${message}\n`,
        (err) => {
            if(err)
                return console.error('Unable to write to message log file')
        }
    )
}

module.exports = {
    logError,
    logMessage
}