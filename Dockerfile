FROM node:13.5.0

LABEL author="Yegor Batov https://github.com/negzu"
WORKDIR /usr/src/telebot

# Install node dependencies
COPY package.json .
COPY package-lock.json .
RUN npm i -g npm@latest
RUN npm ci
COPY . .

# Launch bot
CMD [ "node", "index.js" ]