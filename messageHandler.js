"use strict";

const deleteMessage = message => {
	message.delete()
		.catch(error => console.log(error));
};

const deleteMessageAfterSomeSeconds = message => {
	setTimeout(() => deleteMessage(message), 10000);
};

const findNextAlgBotMessage = fromMessage => {
	return fromMessage.channel.messages.cache.array().find(message => {
		return message.author.username === "AlgBot" && message.createdTimestamp > fromMessage.createdTimestamp; // first AlgBot's message after message
	});
};

const deleteNextAlgBotMessage = message => {
	deleteMessage(findNextAlgBotMessage(message));
};

const onDeleteMessage = message => {
	if (message.content.startsWith("$")) { // if an alg command message is deleted
		deleteNextAlgBotMessage(message);
	}
};

module.exports = {deleteMessage, deleteMessageAfterSomeSeconds, onDeleteMessage};
