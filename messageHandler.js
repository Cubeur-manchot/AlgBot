"use strict";

import {HelpCommandHandler} from "./helpCommandHandler.js";
import {AlgCommandHandler} from "./algCommandHandler.js";
import {FeedbackCommandHandler} from "./feedbackCommandHandler.js";
import {InviteCommandHandler} from "./inviteCommandHandler.js";
import {ServersCommandHandler} from "./serversCommandHandler.js";

class MessageHandler {
	constructor(algBot) {
		this.algBot = algBot;
		this.commandHandler = new CommandHandler(this);
	};
	onMessageCreate = message => {
		if (this.messageIsAlgBotCommand(message) && !this.messageIsInThreadWithoutAlgBot(message)) {
			let commandResult = this.commandHandler.getCommandResult(message);
			this.algBot.discordClient.replyMessage(commandResult.message, message, commandResult.error);
		}
	};
	onMessageDelete = message => {
		if (this.messageIsAlgBotCommand(message)) {
			this.algBot.discordClient.deleteMessage(this.findAlgBotAnswer(message));
		}
	};
	onMessageUpdate = (oldMessage, newMessage) => {
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
	messageIsInThreadWithoutAlgBot = message => {
		return this.algBot.discordClient.channelIsThread(message.channel)
			&& message.channel.members.cache.get(message.client.user.id) === undefined;
	};
};

class CommandHandler {
	static embedColors = {
		help: 0xcccc00, // yellow
		alg: 0x0099ff, // blue
		feedback: 0xd67b07, // orange
		servers: 0x771bc2, // purple
		invite: 0x13bf41 // green
	};
	static unrecognizedCommandLabel = {
		english: "Unrecognized command",
		french: "Commande non reconnue"
	};
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
		this.helpCommandHandler = new HelpCommandHandler(this, CommandHandler.embedColors.help);
		this.algCommandHandler = new AlgCommandHandler(this, CommandHandler.embedColors.alg);
		this.feedbackCommandHandler = new FeedbackCommandHandler(this, CommandHandler.embedColors.feedback);
		this.inviteCommandHandler = new InviteCommandHandler(this, CommandHandler.embedColors.invite);
		this.serversCommandHandler = new ServersCommandHandler(this, CommandHandler.embedColors.servers);
		this.unrecognizedCommandLabel = CommandHandler.unrecognizedCommandLabel[this.messageHandler.algBot.language];
	};
	getCommandResult = message => {
		let commandHeader = message.content.split(" ")[0];
		switch (commandHeader.substring(1)) {
			case "help":
				return this.helpCommandHandler.getHelpCommandResult();
			case "invite":
				return this.inviteCommandHandler.getInviteCommandResult();
			case "feedback":
				return this.feedbackCommandHandler.getFeedbackCommandResult();
			case "servers":
				return this.serversCommandHandler.getServersCommandResult();
			case "alg":
				return this.algCommandHandler.getAlgOrDoCommandResult(message.content, false);
			case "do":
				return this.algCommandHandler.getAlgOrDoCommandResult(message.content, true);
			default:
				return this.getUnrecognizedCommandResult(commandHeader);
		};
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
	buildCustomId = baseCustomId => {
		return `${baseCustomId}${this.messageHandler.algBot.prefix}${this.messageHandler.algBot.language}`;
	}
	onInteractionCreate = interaction => {
		if (interaction.isMessageComponent() || interaction.isModalSubmit()) { // string select, button, modal submit
			if (!this.messageHandler.messageIsAlgBotMessage(interaction.message)) {
				return;
			}
			switch (interaction.customId) {
				case this.helpCommandHandler.helpSelectOptionCustomId:
					this.helpCommandHandler.handleHelpStringSelectInteraction(interaction);
					break;
				case this.feedbackCommandHandler.commandErrorFeedbackButtonCustomId:
					this.feedbackCommandHandler.handleCommandErrorFeedbackButtonInteraction(interaction);
					break;
				case this.feedbackCommandHandler.otherFeedbackButtonCustomId:
					this.feedbackCommandHandler.handleOtherFeedbackButtonInteraction(interaction);
					break;
				case this.feedbackCommandHandler.commandErrorFeedbackModalCustomId:
					this.feedbackCommandHandler.handleCommandErrorFeedbackModalSubmit(interaction);
					break;
				case this.feedbackCommandHandler.otherFeedbackModalCustomId:
					this.feedbackCommandHandler.handleOtherFeedbackModalSubmit(interaction);
					break;
			};
		}
	};
};

export {MessageHandler};
