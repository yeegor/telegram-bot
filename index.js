const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const dateHelper = require('./helpers/date');

const ERROR_LOG_PATH = './data/log.txt';

const bot = new TelegramBot(TOKEN, { polling: true });

console.clear();

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