// Node modules
var fs = require('fs');
var mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

// Local imports
var dateHelper = require('./helpers/date');
var { logError, logMessage } = require('./helpers/logger');

// Getting data from .env
const { CONNECTION_STRING, TOKEN } = require('./config');

// Connecting API
const bot = new TelegramBot(TOKEN, { polling: true });
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });
var db = mongoose.connection;

// DB handlers
db.on('error',
    error => {
        logError(error);
        return console.error('DB connection error: ', error);
    }
);

db.on('open',
    () => logMessage('DB connection has been estabilished')
);

// DB schema
const schema = new mongoose.Schema({
    subject: String,
    remindAt: Date,
    chatId: Number,
    senderId: Number
});

// DB notification model
var Notification = mongoose.model('Notification', schema);

// Bot handlers
bot.onText(/Бот, (.+), напомни (.+) в (.+)/,
    (msg, match) => {
        const [fullMessageText, subject, date, time] = match;
        const { chat: { id: chatId }, from: { id: senderId } } = msg;
        const remindAt = dateHelper.parse(date, time);

        if(remindAt < new Date()){
            bot.sendMessage(chatId, 'Не могу напомнить в прошлом, сами решайте свои проблемы');
            return;
        }

        const notification = new Notification({
            subject,
            remindAt,
            chatId,
            senderId
        });

        notification.save((error, notification) => {
            if(error) {
                logError(error);
                return console.error(error);
            }
            const { chat: { id }, from: { username } } = msg;
            logMessage(`Memorized a message from ${username}`);
            bot.sendMessage(id, 'Запомнил')
        });
    }
)

bot.on('polling_error',
    error => {
        logError(error);
        return console.error(error);
    }
)

const sendNotifications = (bot, document) => {
    const { subject, chatId, senderId } = document;
    const message = 'Напоминаю! ' + subject.charAt(0).toUpperCase() + subject.substring(1);
    bot.sendMessage(chatId, message);
    bot.sendMessage(senderId, message);
}

setInterval(() => {
    logMessage('Triggered reminder check');

    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    Notification.find(
        { remindAt: now },
        (err, docs) => {
            if(err) {
                logError(err);
                return console.error(err);
            }
            docs.forEach((document) => {
                sendNotifications(bot, document);
                //Notification.deleteOne({})
            });
        }
    )
}, 1000 * 60);