// Node modules
var fs = require('fs');
var mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

// Local imports
var dateHelper = require('./helpers/date');
var { logError, logMessage } = require('./helpers/logger');

// Getting data from .env
const { CONNECTION_STRING, TOKEN, i18n: { __ } } = require('./config');

// Connecting API
const bot = new TelegramBot(TOKEN, { polling: true });
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });
var db = mongoose.connection;

// DB handlers
db.on('error',
    error => {
        logError(error);
        return console.error(__('DB connection error: '), error);
    }
);

db.on('open',
    () => logMessage(__('DB connection has been estabilished'))
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
// TODO: fix regexp not triggering in english
bot.onText(new RegExp(__('Bot, remind me of (.+) on (.+) at (.+)')),
    (msg, match) => {
        const [fullMessageText, subject, date, time] = match;
        const { chat: { id: chatId }, from: { id: senderId } } = msg;
        const remindAt = dateHelper.parse(date, time);

        if(remindAt < new Date()){
            bot.sendMessage(chatId, __('Cannot remind in the past, resolve your problems yourselves'));
            return;
        }

        const notification = new Notification({
            subject,
            remindAt,
            chatId,
            senderId
        });

        const { chat: { id }, from: { username } } = msg;
        // TODO: Implement timeout
        return notification.save()
            .then(() => {
                logMessage(__('Memorized a message from %s', username));
                bot.sendMessage(id, __('Memorized!'));
            })
            .catch((err) => {
                logError(err);
                bot.sendMessage(id, __('Did not memorize that, having troubles :('));
            });
    }
)

bot.onText(/Бот, привет/,
    (msg) => {
        const { chat: { id }, from: { username } } = msg;
        bot.sendMessage(id, __('Hello, @%s', username));
    }
)

bot.onText(/@here/,
    async (msg) => {
        const { chat: { id }, from: { username: senderUsername } } = msg;
        const adminList = await bot.getChatAdministrators(id);

        const message = adminList.reduce((msg, current) => {
            const { user: { username, is_bot } } = current;
            if (is_bot || !username || username == senderUsername) return msg;
            return  `${msg} @${username}`;
        }, '');

        bot.sendMessage(id, message);
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
    const message = __('I remind! ') + subject.charAt(0).toUpperCase() + subject.substring(1);
    bot.sendMessage(chatId, message);
    bot.sendMessage(senderId, message);
}

setInterval(() => {
    logMessage(__('Reminder check triggered'));

    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    Notification.find({ remindAt: now })
        .then((docs) => {
            docs.forEach((document) => {
                sendNotifications(bot, document);
                Notification.deleteOne({_id: document.id})
                    .then(() => logMessage(__('Deleted a following message from the database : %s', document.toString())))
                    .catch((err) => logError(err));
            });
        })
        .catch((err) => logError(err));

}, 1000 * 30);

deleteStickerFromChat = (message) => {
    bot.deleteMessage(message.chat.id, message.message_id);
    bot.sendMessage(message.chat.id, `${message.from.first_name ? message.from.first_name : message.from.username}: ${message.sticker.emoji}`);
}

bot.on('sticker',
    (message) => {
        setTimeout(deleteStickerFromChat, 1000 * 5, message);
    }
)
