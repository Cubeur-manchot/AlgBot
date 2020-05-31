/* console commands :
- initialize npm : npm init
- install discord.js : npm install --save discord.js
- install dotenv.js : npm install --save dotenv
- install pm2.js : npm install --save pm2
- install pm2-windows-startup : npm install --save pm2-windows-startup
- launch script via node : node index.js
- or launch script via pm2 : pm2 start index.js
*/

const Discord = require("discord.js");
require("dotenv").config();

const {onReady, onMessage, onMessageUpdate, onMessageDelete} = require("./eventHandler.js");

const createAlgBot = (language, token) => {
	const AlgBot = new Discord.Client();

	AlgBot.on("ready", () => onReady(AlgBot, language));
	AlgBot.on("message", message => onMessage(message, language));
	AlgBot.on("messageUpdate", (oldMessage, newMessage) => onMessageUpdate(oldMessage, newMessage, language));
	AlgBot.on("messageDelete", message => onMessageDelete(message, language));

	AlgBot.login(token)
		.then(() => console.log("AlgBot (" + language + ") is logged in !"))
		.catch(console.error);
};

createAlgBot("french", process.env.TOKEN_FRENCH);
createAlgBot("english", process.env.TOKEN_ENGLISH);
