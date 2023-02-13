"use strict";

class MessageHandler {
	constructor(algBot) {
		this.algBot = algBot;
		this.commandHandler = new CommandHandler(this);
		this.embedHandler = new MessageEmbedHandler(this);
		this.componentsHandler = new MessageComponentsHandler(this);
	};
	onMessageCreate = message => {
		if (this.messageIsAlgBotCommand(message)) {
			let commandResult = this.commandHandler.getCommandResult(message);
			this.algBot.discordClient.reply(commandResult.message, message, commandResult.error);
		}
	};
	onMessageDelete = message => {
		if (this.messageIsAlgBotCommand(message)) {
			this.algBot.discordClient.deleteMessage(this.findAlgBotAnswer(message));
		}
	};
	onMessageUpdate = (oldMessage, newMessage) => {
		if (newMessage.author.id !== "217709941081767937") {
			return;
		}
		if (this.messageIsAlgBotCommand(oldMessage)) {
			let previousAnswer = this.findAlgBotAnswer(oldMessage);
			if (this.messageIsAlgBotCommand(newMessage)) {
				let commandResult = this.commandHandler.getCommandResult(newMessage);
				this.algBot.discordClient.editMessage(previousAnswer, commandResult.message, commandResult.error, newMessage);
			} else {
				this.algBot.discordClient.deleteMessage(previousAnswer);
			}
		} else {
			this.onMessageCreate(newMessage);
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
	static unrecognizedCommandLabel = {
		english: "Unrecognized command",
		french: "Commande non reconnue"
	};
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
		this.unrecognizedCommandLabel = CommandHandler.unrecognizedCommandLabel[messageHandler.algBot.language];
	};
	getCommandResult = message => {
		let commandHeader = message.content.split(" ")[0];
		switch (commandHeader.substring(1)) {
			case "help":
				return this.getHelpCommandResult();
			default:
				return this.getUnrecognizedCommandResult(commandHeader);
		}
	};
	getErrorMessage = errorMessage => {
		return `:x: ${errorMessage}.`;
	};
	getUnrecognizedCommandResult = commandHeader => {
		return {
			message: {
				textContent: this.getErrorMessage(`${this.unrecognizedCommandLabel} : ${commandHeader}`)
			},
			error: true
		};
	};
	getHelpCommandResult = () => {
		return {
			message: {
				textContent: "the help message" // todo
			},
			error: false
		};
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
