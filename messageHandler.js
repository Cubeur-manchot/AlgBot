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
				embed: this.messageHandler.embedHandler.createGeneralHelpMessageEmbed()
			},
			error: false
		};
	};
};

class MessageEmbedHandler {
	static generalHelpMessageTitle = {
		english: "Help",
		french: "Aide"
	};
	static generalHelpMessage = {
		english: 
			"I'm a :robot: that displays <:3x3solved:708049634349547531> images\n"
			+ "\n`$alg` : displays the case that the alg solves```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$do` : applies the alg on a solved cube and displays the result```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$help` : displays this help```parser3\n$help```"
			+ "\n`$options` : displays the available options```parser3\n$options```"
			+ "\n`$alglist` : displays the registered algs, and how to use them```parser3\n$alglist```"
			+ "\nIf the command is edited/deleted, I'll automatically adapt my answer.\n"
			+ "\nIf a command is not correct, I'll send an error message,"
			+ " and I'll delete the command after 10 seconds to clean the channel.\n"
			+ "\nIf you find a bug, please send a PM to Cubeur-manchot#7706 so he can repair me :wrench:",
		french:
			"Je suis un :robot: qui affiche des images de <:3x3solved:708049634349547531>\n"
			+ "\n`$alg` : affiche le cas que l'algo résout```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$do` : applique l'algo sur un cube résolu et affiche le résultat```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$help` : affiche cette aide```parser3\n$help```"
			+ "\n`$options` : affiche les options disponibles```parser3\n$options```"
			+ "\n`$alglist` : affiche les algos enregistrés, ainsi que comment les utiliser```parser3\n$alglist```"
			+ "\nSi la commande est modifiée ou supprimée, j'adapte automatiquement ma réponse.\n"
			+ "\nSi une commande n'est pas bonne, j'envoie un message d'erreur dans le chan,"
			+ " et je supprime la commande au bout de 10 secondes pour faire le ménage.\n"
			+ "\nSi vous me trouvez un bug, merci d'envoyer un MP à Cubeur-manchot#7706 pour qu'il puisse me réparer :wrench:"
	};
	static embedColors = {
		help: 0xcccc00 // yellow
	};
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
		this.generalHelpMessageTitle = MessageEmbedHandler.generalHelpMessageTitle[this.messageHandler.algBot.language];
		this.generalHelpMessage = MessageEmbedHandler.generalHelpMessage[this.messageHandler.algBot.language];
	};
	createGeneralHelpMessageEmbed = () => {
		return {
			color: MessageEmbedHandler.embedColors.help,
			title: this.generalHelpMessageTitle,
			description: this.generalHelpMessage
		};
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
