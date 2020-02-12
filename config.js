const dotenv = require('dotenv');
const i18n = require('i18n');

dotenv.config();

i18n.configure({
    locales:['en', 'ru'],
    defaultLocale: process.env.LOCALE,
    directory: __dirname + '/lang',
    register: global
});

module.exports = {
    TOKEN: process.env.TOKEN,
    ERROR_LOG_PATH: process.env.ERROR_LOG_PATH,
    MESSAGE_LOG_PATH: process.env.MESSAGE_LOG_PATH,
    i18n: i18n
}