# telegram-bot
Telegram bot for daily purposes

### Main tech arsenal
* [node.js](nodejs.org) v13.5.0
* [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
* [mongoose](https://mongoosejs.com/)
* [mongoDB](https://cloud.mongodb.com)

### Description
Simple telegram bot for daily purposes, implemented functions:
* Reminders - tell bot to remind you of something at specific date and time and it will!
* @here - add this bot to telegram chat and use @here to ping all admins of that chat (even with minor permissions)
* /nahuy - erase all queued stickers

### Installation
* Clone this repository
* Install node dependencies: ```npm ci```
* Rename .env.example to .env and fill all the fields (you will need Telegram bot API token for this)
* Launch the bot: ```npm start```
* Enjoy
