"use strict";

class MessageHandler {
	constructor(algBot) {
		this.algBot = algBot;
	};
	onMessageCreate = message => {
	};
	onMessageDelete = message => {
		if (this.messageIsAlgBotCommand(message)) {
			this.algBot.discordClient.deleteMessage(this.findAlgBotAnswer(message));
		}
	};
	messageIsAlgBotCommand = message => {
		return message.content.startsWith(this.algBot.prefix)
			&& !message.author.bot;
	};
	messageIsAlgBotMessage = message => {
		return message.author.id === this.algBot.discordClient.user.id;
	};
	findAlgBotAnswer = message => {
		return [...message.channel.messages.cache.values()].find(channelMessage =>
			this.messageIsAlgBotMessage(channelMessage) && channelMessage.reference.messageId === message.id
		);
	};
};

class CommandHandler {
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
	};
	getCommandResult = message => {
		let commandHeader = message.content.split(" ")[0];
		switch (commandHeader.substring(1)) {
		}
	};
	getErrorMessage = errorMessage => {
		return `:x: ${errorMessage}.`;
	};
};

class MessageEmbedHandler {
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
	};
};

class MessageComponentsHandler {
	static componentTypes = {
		row: 1,
		button: 2,
		select: 3
	};
	static buttonStyles = {
		primary: 1,
		link: 5
	};
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
	};
	createLinkButton = (label, url) => {
		return {
			type: MessageComponentsHandler.componentTypes.button,
			style: MessageComponentsHandler.buttonStyles.link,
			label: label,
			url: url
		};
	};
	createSelect = valueLabelPairs => {
		return {
			type: MessageComponentsHandler.componentTypes.select,
			options: valueLabelPairs,
			custom_id: "selectCustomId"
		};
	};
	createRow = components => {
		return {
			type: MessageComponentsHandler.componentTypes.row,
			components: components
		};
	};
}

export {MessageHandler};
