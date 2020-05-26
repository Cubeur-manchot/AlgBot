"use strict";

const {getInfoFromCommand} = require("./commandHandler.js");
const {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotCorrespondingMessage} = require("./messageHandler.js");

const onReady = (AlgBot) => {
	AlgBot.user.setActivity("attendre d'afficher des algos")
		.then(() => console.log("AlgBot is ready !"))
		.catch(console.error);
};

const onMessage = message => {
	if (messageIsAlgBotCommand(message)) {
		let commandInfo = getInfoFromCommand(message);
		sendMessageToChannel(message.channel, commandInfo.answerContent, commandInfo.answerOptions);
		if (commandInfo.errorInCommand) {
			deleteMessageAfterSomeSeconds(message);
		}
	} // else normal message, don't mind
};

const onMessageUpdate = (oldMessage, newMessage) => {
	if (messageIsAlgBotCommand(oldMessage)) { // if previous message was already a command, delete the previous answer
		deleteNextAlgBotCorrespondingMessage(newMessage, getInfoFromCommand(oldMessage));
	}
	onMessage(newMessage); // treat the message as if it was send
};

const onMessageDelete = message => {
	if (messageIsAlgBotCommand(message)) {
		deleteNextAlgBotCorrespondingMessage(message, getInfoFromCommand(message));
	}
};

module.exports = {onReady, onMessage, onMessageUpdate, onMessageDelete};