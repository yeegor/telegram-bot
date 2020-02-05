const dotenv = require('dotenv');
const i18n = require('i18n');

dotenv.config();
const CONNECTION_STRING = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@notedb-yunw7.mongodb.net/test?retryWrites=true&w=majority`;

//const databaseUrl = 'mongodb://localhost:27017/test';

i18n.configure({
    locales:['en', 'ru'],
    defaultLocale: process.env.LOCALE,
    directory: __dirname + '/lang',
    register: global
});

module.exports = {
    databaseUrl,
    CONNECTION_STRING,
    DBUSER: process.env.MONGO_USER,
    DBPASS: process.env.MONGO_PASS,
    TOKEN: process.env.TOKEN,
    ERROR_LOG_PATH: process.env.ERROR_LOG_PATH,
    MESSAGE_LOG_PATH: process.env.MESSAGE_LOG_PATH,
    i18n: i18n
}