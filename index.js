// Node modules
var mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

// Local imports
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
        return console.error(`Ошибка подключения к базе: ${error}`);
    }
);

db.on('open',
    () => logMessage('Подключение к базе установлено')
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
bot.onText(/Бот, (?<subject>.+), напомни (?<day>\d\d?)(\.|\/)(?<month>\d\d?)(\.|\/)(?<year>\d\d\d\d) в (?<hours>\d\d?):(?<minutes>\d\d)/,
    (msg, match) => {
        const { groups: { subject, year, month, day, hours, minutes } } = match;
        const { chat: { id: chatId }, from: { id: senderId } } = msg;
        const remindAt = new Date(year, month - 1, day, hours, minutes);

        if(remindAt < new Date()){
            bot.sendMessage(chatId,'Не могу напомнить в прошлом, сами решайте свои проблемы');
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
                logMessage(`Запомнил сообщение от ${username}`);
                bot.sendMessage(id, 'Запомнил!');
            })
            .catch((err) => {
                logError(err);
                bot.sendMessage(id, 'Не запомнил, у меня проблемы 😔');
            });
    }
)

bot.onText(/Бот, привет/,
    (msg) => {
        const { chat: { id }, from: { username } } = msg;
        bot.sendMessage(id, `Hello, @${username}`);
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
        // logError(error);
        return console.error(error);
    }
)

// * Sticker killer functionality

const sendNotifications = (bot, document) => {
    const { subject, chatId, senderId } = document;
    const message = `Я напоминаю! ${subject.charAt(0).toUpperCase()}${subject.substring(1)}`;
    if(chatId !== senderId) bot.sendMessage(chatId, message);
    bot.sendMessage(senderId, message);
}

setInterval(() => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    Notification.find({ remindAt: { $lte: now } })
        .then((docs) => {
            docs.forEach((document) => {
                sendNotifications(bot, document);
                Notification.deleteOne({_id: document.id})
                    .then(() => logMessage(`Удалил сообщение из базы : ${document.toString()}`))
                    .catch(err => logError(err));
            });
        })
        .catch((err) => logError(err));

}, 1000 * 30);

deleteStickerFromChat = (message) => {
    bot.deleteMessage(message.chat.id, message.message_id);
    bot.sendMessage(message.chat.id, `${message.from.first_name ? message.from.first_name : message.from.username}: ${message.sticker.emoji}`);
}

const Queue = require('./helpers/queue');
var stickerQueue = new Queue;

bot.on('sticker',
    (message) => {
        stickerQueue.enqueue(message);
    }
)

bot.onText(/\/nahuy$/,
    (commandMessage) => {
        bot.deleteMessage(commandMessage.chat.id, commandMessage.message_id);
        stickerQueue.forEach(
            message => {
                bot.deleteMessage(message.chat.id, message.message_id)
                    .then(() => stickerQueue.dequeue());
            }
        );
        bot.sendMessage(commandMessage.chat.id, __('Fuck stickers'));
    }
)