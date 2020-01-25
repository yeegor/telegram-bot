const dotenv = require('dotenv');
dotenv.config();

const CONNECTION_STRING = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@notedb-yunw7.mongodb.net/test?retryWrites=true&w=majority`;

module.exports = {
    CONNECTION_STRING,
    TOKEN: process.env.TOKEN,
    ERROR_LOG_PATH: process.env.ERROR_LOG_PATH
}