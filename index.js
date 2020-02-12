// Node modules
const TelegramBot = require('node-telegram-bot-api');

// Local imports
var { logError, logMessage } = require('./helpers/logger');

// Getting data from .env
const { TOKEN, i18n: { __ } } = require('./config');

// Connecting API
const bot = new TelegramBot(TOKEN, { polling: true });

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
        // logError(error);
        return console.error(error);
    }
)

// * Sticker killer functionality

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