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

const editNextAlgBotCorrespondingMessage = (message, oldInfo, newInfo) => {
	let algBotAnswer = findNextAlgBotCorrespondingMessage(message, oldInfo);
	console.log("---------------\n\n");
	console.log(algBotAnswer);
	console.log(algBotAnswer.attachments);
	console.log(algBotAnswer.attachments.array()[0]);
	algBotAnswer.author = message.author;
	console.log(algBotAnswer.author);
	console.log(algBotAnswer.attachments);
	algBotAnswer.edit(newInfo.answerContent, newInfo.answerOptions);
	//algBotAnswer.content = newInfo.answerContent;
	//algBotAnswer.options = newInfo.answerOptions;
};

module.exports = {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotCorrespondingMessage};
