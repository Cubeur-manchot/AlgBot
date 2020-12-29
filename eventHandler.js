"use strict";

const {getResultOfCommand} = require("./commandHandler.js");
const {messageIsAlgBotCommand, messageIsAlgBotMessage, sendMessageToChannel,
	deleteMessageAfterSomeSecondsIfNotModified, deleteNextAlgBotCorrespondingNormalMessage,
	sendEmbedToChannel, editEmbeddedMessage, editNextAlgBotCorrespondingEmbeddedMessage, deleteNextAlgBotCorrespondingEmbeddedMessage,
	planViewRotationReactionList, isometricViewRotationReactionList} = require("./messageHandler.js");

const onReady = (AlgBot, language) => {
	let activity = language === "french" ? "attendre d'afficher des algos" : "waiting for displaying algs";
	AlgBot.user.setActivity(activity)
		.then(() => console.log("AlgBot (" + language + ") is ready !"))
		.catch(console.error);
};

const onMessage = (message, language) => {
	if (messageIsAlgBotCommand(message)) {
		let commandInfo = getResultOfCommand(message, language);
		if (commandInfo.isAlgOrDoCommandWithoutError) { // send embed
			sendEmbedToChannel(message.channel, commandInfo.answerEmbed, commandInfo.rotatable);
		} else { // send informative message
			sendMessageToChannel(message.channel, commandInfo.answerTextContent);
			if (commandInfo.errorInCommand) {
				deleteMessageAfterSomeSecondsIfNotModified(message);
			}
		}
	} // else normal message, don't mind
};

const onMessageUpdate = (oldMessage, newMessage, language) => {
	if (messageIsAlgBotCommand(oldMessage)) {
		if (messageIsAlgBotCommand(newMessage)) { // message was an AlgBot command, and has been edited to another AlgBot command
			let oldCommandInfo = getResultOfCommand(oldMessage, language);
			if (oldCommandInfo.isAlgOrDoCommandWithoutError) {
				let newCommandInfo = getResultOfCommand(newMessage, language);
				if (newCommandInfo.isAlgOrDoCommandWithoutError) { // both old and new answer are an embed
					editNextAlgBotCorrespondingEmbeddedMessage(oldMessage, oldCommandInfo.answerEmbed.title, newCommandInfo.answerEmbed); // edit answer embed
				} else { // old answer was an embed, but new answer is a simple message
					deleteNextAlgBotCorrespondingEmbeddedMessage(oldMessage, oldCommandInfo.answerEmbed.title); // delete old answer
					sendMessageToChannel(newMessage.channel, newCommandInfo.answerTextContent);
					if (newCommandInfo.errorInCommand) {
						deleteMessageAfterSomeSecondsIfNotModified(newMessage);
					}
				}
				//sendEmbedToChannel(message.channel, commandInfo.answerEmbed);
			} else { // old answer was a simple message
				deleteNextAlgBotCorrespondingNormalMessage(oldMessage, oldCommandInfo.answerTextContent); // delete old answer
				onMessage(newMessage, language); // treat edited message as if it was sent
			}
		} else { // message was an AlgBot command, but is not anymore
			onMessageDelete(oldMessage, language); // behave as if the old command message was deleted
		}
	} else { // old message was not an AlgBot command
		onMessage(newMessage, language); // treat the message as if it was send
	}
};

const onMessageDelete = (message, language) => {
	if (messageIsAlgBotCommand(message)) {
		let resultOfCommand = getResultOfCommand(message, language);
		if (resultOfCommand.isAlgOrDoCommandWithoutError) {
			deleteNextAlgBotCorrespondingEmbeddedMessage(message, resultOfCommand.answerEmbed.title);
		} else {
			deleteNextAlgBotCorrespondingNormalMessage(message, resultOfCommand.answerTextContent);
		}
	}
};

const rotationToAddList = ["x", "x'", "y", "y'", "z", "z'",];

const onMessageReact = (reaction, user) => {
	if (!user.bot) { // a normal person reacts
		let message = reaction.message;
		if (messageIsAlgBotMessage(message) && message.embeds.length) { // reacted to an AlgBot message containing an embed
			let embed = message.embeds[0];
			let emojiName = reaction._emoji.name;
			let indexOfEmoji = (embed.image.url.includes("&view=plan") ? planViewRotationReactionList : isometricViewRotationReactionList)
				.indexOf(emojiName);
			if (indexOfEmoji !== -1) {
				reaction.users.remove(user).catch(console.error); // remove reaction, to be able to react many times
				let rotationToAdd = rotationToAddList[indexOfEmoji];
				if (embed.image.url.includes("case")) { // $alg command
					rotationToAdd = rotationToAdd.includes("'") ? rotationToAdd[0] : rotationToAdd + "'"; // invert rotation
					embed.image.url = embed.image.url.replace("&case=","&case=" + rotationToAdd); // insert rotation before the alg
				} else { // $do command
					embed.image.url += rotationToAdd; // simply add the rotation at the end
				}
				editEmbeddedMessage(message, embed); // replace old embed with new one
			}
		}
	}
};

module.exports = {onReady, onMessage, onMessageUpdate, onMessageDelete, onMessageReact};
