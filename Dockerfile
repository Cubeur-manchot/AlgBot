FROM node:18-alpine

ENV NODE_ENV production

COPY package.json .

RUN npm install

COPY index.js algBot.js date.js logger.js discordClient.js messageHandler.js messageComponentHandler.js /
COPY algCommandHandler.js algManipulator.js optionsHandler.js imageBuilder.js /
COPY helpCommandHandler.js feedbackCommandHandler.js serversCommandHandler.js /

CMD ["node", "index.js"]
