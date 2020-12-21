"use strict";

const Discord = require("discord.js");

// general information about message

const messageIsAlgBotCommand = message => {
	return message.content.match(/^\$[A-Za-z]/);
};

const messageIsAlgBotMessage = message => {
	return message.author.username === "AlgBot";
};

// message handling (send/delete/modify)

const sendMessageToChannel = (channel, message) => {
	channel.send(message).catch(console.error);
};

const sendEmbedToChannel = (channel, embedObject) => {
	channel.send(new Discord.MessageEmbed(embedObject))
		.catch(console.error)
		.then(message => {
			if (message) {
				message.react("❤").catch(console.error);
			}
			if (message) {
				message.react("💩").catch(console.error);
			}
			if (message) {
				message.react("🥇").catch(console.error);
			}
			if (message) {
				message.react("👽").catch(console.error);
			}
		});
};

const deleteMessage = message => {
	if (message && !message.deleted) {
		message.delete()
			.catch(error => console.log(error));
	}
};

const deleteMessageAfterSomeSecondsIfNotModified = message => {
	let lastUpdateTimeStamp = message.edits.length === 1 ? message.createdTimestamp : message.editedTimestamp;
	setTimeout(() => {
		if (message.editedTimestamp <= lastUpdateTimeStamp) { // message has not been modified since lastUpdateTimeStamp
			deleteMessage(message);
		}
	}, 10000);
};

const deleteNextAlgBotCorrespondingNormalMessage = (fromMessage, answerTextContent) => {
	deleteMessage(fromMessage.channel.messages.cache.array().find(message => {
		return messageIsAlgBotMessage(message) // AlgBot's message
			&& message.createdTimestamp > fromMessage.createdTimestamp // first corresponding after given message
			&& message.content === answerTextContent; // message is exactly the answer of the given command
	}));
};

const findNextAlgBotCorrespondingEmbeddedMessage = (fromMessage, answerEmbedTitle) => {
	return fromMessage.channel.messages.cache.array().find(message => {
		return messageIsAlgBotMessage(message) // AlgBot's message
			&& message.createdTimestamp > fromMessage.createdTimestamp // first corresponding after given message
			&& message.embeds.length !== 0 // has at least one embed
			&& message.embeds[0].title === answerEmbedTitle; // embed title corresponds to searched title
	});
};

const deleteNextAlgBotCorrespondingEmbeddedMessage = (fromMessage, answerEmbedTitle) => {
	deleteMessage(findNextAlgBotCorrespondingEmbeddedMessage(fromMessage, answerEmbedTitle));
};

const editNextAlgBotCorrespondingEmbeddedMessage = (fromMessage, answerEmbedTitle, newEmbedObject) => {
	findNextAlgBotCorrespondingEmbeddedMessage(fromMessage, answerEmbedTitle)
		.edit(new Discord.MessageEmbed(newEmbedObject))
		.catch(console.error);
};

// embed building

const buildEmbed = resultOfAlgOrDoCommand => {
	let moveSequenceForUrl = resultOfAlgOrDoCommand.moveSequence.replace(/ /g, "%20");
	return {
		color: "#0099ff",
		title: resultOfAlgOrDoCommand.moveSequence,
		url: `https://alg.cubing.net/?alg=${moveSequenceForUrl}` // move sequence
			+ (resultOfAlgOrDoCommand.algOrDo === "alg" ? `&setup=(${moveSequenceForUrl})-` : "") // inverse move sequence as setup
			+ `&puzzle=${resultOfAlgOrDoCommand.puzzle}x${resultOfAlgOrDoCommand.puzzle}x${resultOfAlgOrDoCommand.puzzle}`, // puzzle
		image: {
			url: resultOfAlgOrDoCommand.imageUrl
		}
	};
};

module.exports = {messageIsAlgBotCommand,
	sendMessageToChannel, deleteMessageAfterSomeSecondsIfNotModified, deleteNextAlgBotCorrespondingNormalMessage,
	buildEmbed, sendEmbedToChannel, editNextAlgBotCorrespondingEmbeddedMessage, deleteNextAlgBotCorrespondingEmbeddedMessage};
