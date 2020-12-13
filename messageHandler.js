"use strict";

const Discord = require("discord.js");

// general information about message

const messageIsAlgBotCommand = message => {
	return message.content.match(/^\$[A-Za-z]/);
};

const messageIsAlgBotMessage = message => {
	return message.author.username === "AlgBot";
};

const findNextAlgBotCorrespondingMessage = (fromMessage, messageInfo) => {
	return fromMessage.channel.messages.cache.array().find(message => {
		return messageIsAlgBotMessage(message) // AlgBot's message
			&& message.createdTimestamp > fromMessage.createdTimestamp // first corresponding after given message
			&& message.content === messageInfo.answerContent; // message is exactly the answer of the given command
	});
};

// message handling (send/delete/modify)

const sendMessageToChannel = (channel, message) => {
	channel.send(message).catch(console.error);
};

const sendEmbedToChannel = (channel, embedObject) => {
	channel.send(new Discord.MessageEmbed(embedObject))
		.catch(console.error)
		.then(message => {
			message.react("❤").catch(console.error);
			message.react("💩").catch(console.error);
			message.react("🥇").catch(console.error);
			message.react("👽").catch(console.error);
		});
};

const deleteMessage = message => {
	if (message) {
		message.delete()
			.catch(error => console.log(error));
	}
};

const deleteMessageAfterSomeSeconds = message => {
	setTimeout(() => deleteMessage(message), 10000);
};

const deleteNextAlgBotCorrespondingMessage = (message, messageInfo) => {
	deleteMessage(findNextAlgBotCorrespondingMessage(message, messageInfo));
};

// embed building

const buildEmbed = resultOfAlgOrDoCommand => {
	return {
		color: "#0099ff",
		title: resultOfAlgOrDoCommand.moveSequence,
		url: `https://alg.cubing.net/?alg=${resultOfAlgOrDoCommand.moveSequence}` // move sequence
			+ (resultOfAlgOrDoCommand.algOrDo === "alg" ? `&setup=(${resultOfAlgOrDoCommand.moveSequence})-` : "") // inverse move sequence as setup
			+ `&puzzle=${resultOfAlgOrDoCommand.puzzle}x${resultOfAlgOrDoCommand.puzzle}x${resultOfAlgOrDoCommand.puzzle}`, // puzzle
		image: {
			url: resultOfAlgOrDoCommand.imageUrl
		}
	};
};

module.exports = {messageIsAlgBotCommand,
	sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotCorrespondingMessage,
	buildEmbed, sendEmbedToChannel};
