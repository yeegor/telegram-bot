// Node modules
var mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

// Local imports
var { logError, logMessage, clearLogs } = require('./helpers/logger');
clearLogs();

// Getting data from .env
const { CONNECTION_STRING, TOKEN, MAKEMEADMIN } = require('./config');

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
const notificationSchema = new mongoose.Schema({
    subject: String,
    remindAt: Date,
    chatId: Number,
    senderId: Number
});

const administratorSchema = new mongoose.Schema({
    userId: Number,
    userName: String
});

// DB notification model
const Notification = mongoose.model('Notification', notificationSchema);
const Administrator = mongoose.model('Administrator', administratorSchema);

// Bot handlers
bot.onText(/Бот, (?<subject>.+), напомни (?<day>\d\d?)(\.|\/)(?<month>\d\d?)(\.|\/)(?<year>\d\d\d\d) в (?<hours>\d\d?):(?<minutes>\d\d)/,
    async (msg, match) => {
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
        try{
            await notification.save();
        } catch(err) {
            logError(err);
            bot.sendMessage(id, 'Не запомнил, у меня проблемы 😔');
        }
        logMessage(`Запомнил сообщение от ${username}`);
        bot.sendMessage(id, 'Запомнил!');
    }
)

bot.onText(/Бот, привет/,
    (msg) => {
        const { chat: { id }, from: { username } } = msg;
        bot.sendMessage(id, `Привет, @${username}`);
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

const capitalize = (text) => {
    return `${text.charAt(0).toUpperCase()}${text.substring(1)}`;
}

const sendNotifications = (bot, document) => {
    const { subject, chatId, senderId } = document;
    const message = `Я напоминаю! ${capitalize(subject)}`;
    if(chatId !== senderId) bot.sendMessage(chatId, message);
    bot.sendMessage(senderId, message);
}

setInterval(async () => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    let docs;
    try{
        docs = await Notification.find({ remindAt: { $lte: now } });
    } catch(err) {
        logError(err)
    }

    docs.forEach((document) => {
        sendNotifications(bot, document);
        Notification.deleteOne({_id: document.id})
            .then(() => logMessage(`Удалил сообщение из базы : ${document.toString()}`))
            .catch(err => logError(err));
    });

}, 1000 * 30);

deleteStickerFromChat = (message) => {
    bot.deleteMessage(message.chat.id, message.message_id);
    bot.sendMessage(message.chat.id, `${message.from.first_name ? message.from.first_name : message.from.username}: ${message.sticker.emoji}`);
}

const Queue = require('./helpers/queue');
var stickerQueue = new Queue;
var autokill = false;

bot.on('sticker',
    (message) => {
        if(!autokill) {
            stickerQueue.enqueue(message);
        }
        else bot.deleteMessage(message.chat.id, message.message_id);
    }
)

const isAdminOfBot = (id) => !!Administrator.find({ userId: { $eq: id } });

bot.onText(/\/autokill$/,
    (message) => {
        if(!isAdminOfBot(message.from.id))
            return bot.sendMessage(message.chat.id, `Это админская команда, а ты не админ, @${message.from.username}`);
        autokill = !autokill;
        if(autokill) {
            bot.sendMessage(message.chat.id, 'Я буду удалять все стикеры сразу');
        } else {
            bot.sendMessage(message.chat.id, 'Я немного расслабился');
        }
    }
)

bot.onText(/\/makemeadmin$/,
    async (message) => {
        if (!MAKEMEADMIN) return;

        const { from: { id: userId, first_name: userName } } = message;
        const newAdmin = new Administrator({
            userId,
            userName
        });

        try{
            await newAdmin.save();
        } catch(err) {
            logError(err);
            bot.sendMessage(id, 'Что-то пошло не так, пока что ты не админ 😔');
        }

        logMessage(`Новый адмиин: ${userName}`);
        bot.sendMessage(userId, 'Теперь ты админ! 🎉');
    }
)

bot.onText(/\/nahuy$/,
    (commandMessage) => {
        bot.deleteMessage(commandMessage.chat.id, commandMessage.message_id);
        stickerQueue.forEach(
            async message => {
                await bot.deleteMessage(message.chat.id, message.message_id);
                stickerQueue.dequeue();
            }
        );
        bot.sendMessage(commandMessage.chat.id, 'К чёрту стикеры');
    }
)

bot.onText(/\/say (?<message>.+)/,
    async (message, match) => {
        const { chat: { id: chatId }, from: { username }, message_id } = message;
        const { groups: { message: textToSend } } = match;
        await bot.deleteMessage(chatId, message_id);
        await bot.sendMessage(chatId, capitalize(textToSend));
        logMessage(`${username} попросил меня сказать \'${textToSend}\'`);
    }
)