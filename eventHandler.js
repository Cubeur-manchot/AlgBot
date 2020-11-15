"use strict";

const {getResultOfCommand} = require("./commandHandler.js");
const {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotCorrespondingMessage} = require("./messageHandler.js");

const onReady = (AlgBot, language) => {
	let activity = language === "french" ? "attendre d'afficher des algos" : "waiting for displaying algs";
	AlgBot.user.setActivity(activity)
		.then(() => console.log("AlgBot (" + language + ") is ready !"))
		.catch(console.error);
};

const onMessage = (message, language) => {
	if (messageIsAlgBotCommand(message)) {
		let commandInfo = getResultOfCommand(message, language);
		sendMessageToChannel(message.channel, commandInfo.answerContent, commandInfo.answerOptions, commandInfo.addReactions);
		if (commandInfo.errorInCommand) {
			deleteMessageAfterSomeSeconds(message);
		}
	} // else normal message, don't mind
};

const onMessageUpdate = (oldMessage, newMessage, language) => {
	if (messageIsAlgBotCommand(oldMessage)) { // if previous message was already a command, delete the previous answer
		deleteNextAlgBotCorrespondingMessage(newMessage, getResultOfCommand(oldMessage, language));
	}
	onMessage(newMessage, language); // treat the message as if it was send
};

const onMessageDelete = (message, language) => {
	if (messageIsAlgBotCommand(message)) {
		deleteNextAlgBotCorrespondingMessage(message, getResultOfCommand(message, language));
	}
};

module.exports = {onReady, onMessage, onMessageUpdate, onMessageDelete};
