FROM node:18-alpine

ENV NODE_ENV production

COPY package.json .

RUN npm install

COPY index.js algBot.js date.js logger.js algManipulator.js discordClient.js imageBuilder.js messageHandler.js helpCommandHandler.js algCommandHandler.js messageComponentHandler.js optionsHandler.js /

CMD ["node", "index.js"]
