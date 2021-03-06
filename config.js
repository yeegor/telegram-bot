const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    CONNECTION_STRING: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@notedb-yunw7.mongodb.net/test?retryWrites=true&w=majority`,
    TOKEN: process.env.TOKEN,
    ERROR_LOG_PATH: process.env.ERROR_LOG_PATH,
    MESSAGE_LOG_PATH: process.env.MESSAGE_LOG_PATH,
    MAKEMEADMIN: process.env.MAKEMEADMIN === "on"
}