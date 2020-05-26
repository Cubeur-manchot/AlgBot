"use strict";

const {getGeneralHelpMessage} = require("./help.js");
const {getOptionsHelpMessage} = require("./options.js");
const {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotMessage, parseTheCommand} = require("./messageHandler.js");

// event handling

const onReady = (AlgBot) => {
	AlgBot.user.setActivity("attendre d'afficher des algos")
		.then(() => console.log("AlgBot is ready !"))
		.catch(console.error);
};

const onMessage = message => {
	if (messageIsAlgBotCommand(message)) {
		handleCommand(message);
	} // else normal message, don't mind
};

const onMessageUpdate = (oldMessage, newMessage) => {
	if (messageIsAlgBotCommand(oldMessage)) {
		if (messageIsAlgBotCommand(newMessage)) { // command is edited
			// TO DO
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

// command handling

const handleCommand = message => {
	let answer = {content: "", options: {}}, errorInCommand = false;
	if (message.content.startsWith("$alg") || message.content.startsWith("$do")) {
		let {messageContent, imageUrl, unrecognizedOptions, puzzleIsRecognized, puzzle} = parseTheCommand(message.content);
		if (!puzzleIsRecognized) {
			answer.content = ":x: Puzzle non pris en charge : " + puzzle;
			errorInCommand = true;
		} else if (unrecognizedOptions.length) {
			answer.content = ":x: Option(s) non reconnue(s) :\n" + unrecognizedOptions.join("\n");
			errorInCommand = true;
		} else {
			answer.content = messageContent;
			answer.options = {files: [{attachment: imageUrl, name: "cubeImage.png"}]};
		}
	} else if (message.content.startsWith("$help")) {
		answer.content = getGeneralHelpMessage(message);
	} else if (message.content.startsWith("$options")) {
		answer.content = getOptionsHelpMessage();
	} else {
		answer.content = ":x: Commande non reconnue : " + message.content.split(" ")[0];
		errorInCommand = true;
	}
	sendMessageToChannel(message.channel, answer.content, answer.options);
	if (errorInCommand) {
		deleteMessageAfterSomeSeconds(message);
	}
};

module.exports = {onReady, onMessage, onMessageUpdate, onMessageDelete};