"use strict";

// general information about message

const messageIsAlgBotCommand = message => {
	return message.content.startsWith("$");
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

const sendMessageToChannel = (channel, message, options) => {
	channel.send(message, options)
		.catch(console.error);
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

module.exports = {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotCorrespondingMessage};
