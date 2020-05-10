/* console commands :
- initialize npm : npm init
- install discord.js : npm install --save discord.js
- install pm2.js : npm install --save pm2
- install pm2-windows-startup : npm install --save pm2-windows-startup
- launch script : node index.js
*/

const Discord = require("discord.js");

const {onDeleteMessage, onMessage} = require("./messageHandler.js");
const {onReady} = require("./miscellaneous.js");

const AlgBot = new Discord.Client();

AlgBot.on("ready", () => onReady(AlgBot));

AlgBot.on("messageDelete", message => onDeleteMessage(message));

AlgBot.on("message", message => onMessage(message));

bot.login("NzA1MDQ5NzMzMTI2OTQ2ODM2.XqrfAA.QDRho-SdLkHy8lsjIRMJgszw5Uo");
