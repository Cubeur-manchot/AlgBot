FROM node:18-alpine

ENV NODE_ENV production

COPY package.json .

RUN npm install

COPY indexNew.js algBot.js algManipulator.js discordClient.js imageBuilder.js messageHandlerNew.js /

CMD ["node", "indexNew.js"]
