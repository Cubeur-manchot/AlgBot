"use strict";

const Discord = require("discord.js");

const {onReady, onMessage, onMessageUpdate, onMessageDelete, onMessageReact} = require("./eventHandler.js");

const createAlgBot = (language, token) => {
	const AlgBot = new Discord.Client();

	AlgBot.on("ready", () => onReady(AlgBot, language));
	AlgBot.on("message", message => onMessage(message, language));
	AlgBot.on("messageUpdate", (oldMessage, newMessage) => onMessageUpdate(oldMessage, newMessage, language));
	AlgBot.on("messageDelete", message => onMessageDelete(message, language));
	AlgBot.on("messageReactionAdd", onMessageReact);

	AlgBot.login(token)
		.then(() => console.log("AlgBot (" + language + ") is logged in !"))
		.catch(console.error);
};

createAlgBot("french", process.env.TOKEN_FRENCH);
createAlgBot("english", process.env.TOKEN_ENGLISH);
