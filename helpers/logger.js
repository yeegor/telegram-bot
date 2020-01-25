const fs = require('fs');
const { ERROR_LOG_PATH } = require('../config');

module.exports = (error) => {
    fs.appendFile(
        ERROR_LOG_PATH,
        `${Date.now()}: ${error}\n`,
        () => console.error(`Unable to write to log file`)
    );
}