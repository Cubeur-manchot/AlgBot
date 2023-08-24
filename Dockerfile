FROM node:18-alpine

ENV NODE_ENV production

COPY package.json .

RUN npm install

# general files
COPY index.js algBot.js date.js logger.js  messageHandler.js /
# Discord utils
COPY discordUtils /discordUtils
# alg command
COPY algCommandHandler.js algManipulator.js optionsHandler.js imageBuilder.js /
# other commands
COPY helpCommandHandler.js feedbackCommandHandler.js serversCommandHandler.js inviteCommandHandler.js /
# Holo-Cube from distant repository
ADD https://cubeur-manchot.github.io/Holo-Cube/bundles/holo-cube-algorithm.node-bundle.js holocube.js

CMD ["node", "--no-warnings", "index.js"]
