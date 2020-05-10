"use strict";

const {helpCommand} = require("./help.js");
const {optionsCommand} = require("./options.js");
const {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotMessage, parseTheCommand} = require("./messageHandler.js");

const onReady = (AlgBot) => {
	AlgBot.user.setActivity("attendre d'afficher des algos")
		.then(() => console.log("Algbot is ready !"))
		.catch(console.error);
};

const onMessage = message => {
	if (messageIsAlgBotCommand(message)) {
		handleCommand(message);
	} // else normal message, don't mind
};

const handleCommand = message => {
	if (message.content.startsWith("$alg") || message.content.startsWith("$do")) {
		imageCommand(message);
	} else if (message.content.startsWith("$help")) {
		helpCommand(message);
	} else if (message.content.startsWith("$options")) {
		optionsCommand(message);
	} else {
		unrecognizedCommand(message);
	}
};

const imageCommand = message => {
	let {messageContent, imageUrl, unrecognizedOptions} = parseTheCommand(message.content);
	if (!unrecognizedOptions.length) {
		sendMessageToChannel(message.channel, messageContent, {files: [{attachment: imageUrl, name: "cubeImage.png"}]});
	} else {
		sendMessageToChannel(message.channel, ":x: Option(s) non reconnue(s) :\n" + unrecognizedOptions.join("\n"));
		deleteMessageAfterSomeSeconds(message);
	}
};

const onMessageUpdate = (oldMessage, newMessage) => {
	if (messageIsAlgBotCommand(oldMessage)) {
		if (messageIsAlgBotCommand(newMessage)) { // command is edited
		} else { // message is not a command any more, the answer should be deleted
			deleteNextAlgBotMessage(newMessage);
		}
	} else if (messageIsAlgBotCommand(newMessage)) { // message was not a command, but now it is
		onMessage(newMessage); // exact same behaviour as when a new command is posted
	} // else classical message edit, don't mind
};

const onMessageDelete = message => {
	if (messageIsAlgBotCommand(message)) {
		deleteNextAlgBotMessage(message);
	}
};

const unrecognizedCommand = message => {
	sendMessageToChannel(message.channel, ":x: Commande non reconnue : " + message.content.split(" ")[0]);
	deleteMessageAfterSomeSeconds(message);
};

module.exports = {onReady, onMessage, onMessageUpdate, onMessageDelete};