// Node modules
var fs = require('fs');
var mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

// Local imports
const dateHelper = require('./helpers/date');

// Getting data from .env
const { CONNECTION_STRING, TOKEN, ERROR_LOG_PATH } = require('./config');

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
        console.log('IT IS OPEN');
    }
);

// Bot handlers

bot.on('message',
    msg => {
        console.log(msg);
        if(msg.text.toString().toLowerCase().includes('hi'))
            bot.sendMessage(msg.chat.id, 'Hello!');
    }
)

bot.onText(/Бот, (.+), напомни (.+) в (.+)/,
    (msg, match) => {
        const [subject, date, time] = match;
        const event = {
            subject,
            remindAt: dateHelper.parse(date, time)
        };

    }
)

bot.on('polling_error',
    error => {
        console.error(error);
        fs.appendFile(
            ERROR_LOG_PATH,
            `${Date.now()}: ${error.message}\n`,
            () => console.error(`Unable to write to file:  ${error.message}\n`)
        );
    }
)