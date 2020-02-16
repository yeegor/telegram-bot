const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    TOKEN: process.env.TOKEN,
    ERROR_LOG_PATH: process.env.ERROR_LOG_PATH,
    MESSAGE_LOG_PATH: process.env.MESSAGE_LOG_PATH
}