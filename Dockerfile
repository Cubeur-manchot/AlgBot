FROM node:18-alpine

ENV NODE_ENV production

COPY package.json .

RUN npm install

COPY index.js algBot.js logger.js algManipulator.js discordClient.js imageBuilder.js messageHandler.js /

CMD ["node", "index.js"]
