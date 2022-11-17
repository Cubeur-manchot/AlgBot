FROM node:18-alpine

ENV NODE_ENV production

COPY package.json .

RUN npm install

COPY index.js eventHandler.js messageHandler.js commandHandler.js help.js options.js algs.js algCollection.js merging.js /

CMD ["node", "index.js"]
