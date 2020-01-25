// Node modules
var fs = require('fs');
var mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

// Local imports
var dateHelper = require('./helpers/date');
var log = require('./helpers/logger');

// Getting data from .env
const { CONNECTION_STRING, TOKEN } = require('./config');

// Connecting API
const bot = new TelegramBot(TOKEN, { polling: true });
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });
var db = mongoose.connection;

// DB handlers
db.on('error',
    error => {
        console.error('DB connection error: ', error);
    }
);

db.on('open',
    () => {
        console.log('DB connection has been estabilished');
    }
);

// DB schema
const schema = new mongoose.Schema({
    subject: String,
    remindAt: Date
});

// DB notification model
var Notification = mongoose.model('Notification', schema);

// Bot handlers
bot.onText(/Бот, (.+), напомни (.+) в (.+)/,
    (msg, match) => {
        const [fullMessageText, subject, date, time] = match;
        console.log(dateHelper.parse(date, time));
        const notification = new Notification({
            subject,
            remindAt: dateHelper.parse(date, time)
        });
        notification.save((error, notification) => {
            if(error) {
                log(error);
                return console.error(error);
            }
            const { chat: { id } } = msg;
            bot.sendMessage(id, 'Ok, will do!')
        });
    }
)

bot.on('polling_error',
    error => {
        log(error);
        return console.error(error);
    }
)