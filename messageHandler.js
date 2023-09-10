"use strict";

import Discord from "discord.js";
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
	onMessageCreate = async message => {
		if (this.messageIsAlgBotCommand(message) && !this.messageIsInThreadWithoutAlgBot(message)) {
			let commandResult = await this.commandHandler.getMessageCommandResult(message);
			this.algBot.discordClient.replyMessage(commandResult.message, message, commandResult.error);
		}
	};
	onMessageDelete = message => {
		if (this.messageIsAlgBotCommand(message)) {
			this.algBot.discordClient.deleteMessage(this.findAlgBotAnswer(message));
		}
	};
	onMessageUpdate = async (oldMessage, newMessage) => {
		if (this.messageIsAlgBotCommand(oldMessage)) {
			let previousAnswer = this.findAlgBotAnswer(oldMessage);
			if (this.messageIsAlgBotCommand(newMessage)) {
				let commandResult = await this.commandHandler.getMessageCommandResult(newMessage);
				this.algBot.discordClient.editMessage(previousAnswer, commandResult.message, commandResult.error, newMessage);
			} else {
				this.algBot.discordClient.deleteMessage(previousAnswer);
			}
		} else {
			await this.onMessageCreate(newMessage);
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
	static commands = [{
		name: "alg",
		description: {
			english: "Displays the case that the alg solves.",
			french: "Affiche le cas que l'algo résout."
		},
		argumentsExample: "r U R' F' R U R' U' R' F R2 U' r'"
	}, {
		name: "do",
		description: {
			english: "Applies the alg on a solved cube and displays the result.",
			french: "Applique l'algo sur un cube résolu et affiche le résultat."
		},
		argumentsExample: "r U R' F' R U R' U' R' F R2 U' r'"
	}, {
		name: "help",
		description: {
			english: "Displays this help, the recognized algs and the supported options.",
			french: "Affiche cette aide, les algos reconnus et les options supportées."
		}
	}, {
		name: "invite",
		description: {
			english: "Displays the links to invite me to a server.",
			french: "Affiche les liens pour m'inviter sur un serveur."
		}
	}, {
		name: "feedback",
		description: {
			english: "Allows to give feedback, for example to report a bug.",
			french: "Permet de donner un feedback, par exemple pour rapporter un bug."
		}
	}, {
		name: "servers",
		description: {
			english: "Lists all servers I am on.",
			french: "Liste tous les serveurs sur lesquels je suis."
		}
	}];
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
	onInteractionCreate = async interaction => {
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
		} else if (interaction.isCommand()) { // slash command, user context menu command, message context menu command
			if (!this.interactionIsForAlgBotApplication(interaction)) {
				return;
			}
			let commandResult = await this.getSlashCommandResult(interaction);
			this.messageHandler.algBot.discordClient.replyInteraction(commandResult.message, interaction, commandResult.error);
		}
	};
	interactionIsForAlgBotApplication = interaction => {
		return interaction.applicationId === this.messageHandler.algBot.discordClient.application.id;
	};
	getSlashCommandResult = async interaction => {
		let commandName = interaction.commandName;
		let receivedOptionValuesByType = {};
		for (let optionType of AlgCommandHandler.optionTypes) {
			receivedOptionValuesByType[optionType] = [];
		}
		for (let definedOption of this.algCommandHandler.slashCommandOptions) {
			let receivedOption = interaction.options.get(definedOption.name);
			if (receivedOption) {
				receivedOptionValuesByType[definedOption.type].push(receivedOption.value);
			}
		}
		let command = {
			name: commandName,
			text: receivedOptionValuesByType.text.length
				? receivedOptionValuesByType.text.join(" ")
				: null,
			options: receivedOptionValuesByType.options.length
				? receivedOptionValuesByType.options.join(" ")
				: null,
			comment: receivedOptionValuesByType.comment.length
				? receivedOptionValuesByType.comment.join(" ")
				: null
		};
		return await this.getCommandResult(command);
	};
	getMessageCommandResult = async message => {
		let [name, text, options, comment] = message.content
			.replace(this.messageHandler.algBot.prefix, "")
			.split(/(?<!\s.*)\s+|(?<!\s-.*|\/\/.*)\s+(?=-|\/\/)|(?<!\/\/.*)\s*\/\/\s*/);
		return await this.getCommandResult({name, text, options, comment});
	};
	getCommandResult = async command => {
		switch (command.name) {
			case "help":
				return this.helpCommandHandler.getHelpCommandResult();
			case "invite":
				return this.inviteCommandHandler.getInviteCommandResult();
			case "feedback":
				return this.feedbackCommandHandler.getFeedbackCommandResult();
			case "servers":
				return this.serversCommandHandler.getServersCommandResult();
			case "alg":
				return await this.algCommandHandler.getAlgOrDoCommandResult(command.text, command.options, command.comment, false);
			case "do":
				return await this.algCommandHandler.getAlgOrDoCommandResult(command.text, command.options, command.comment, true);
			default:
				return this.getUnrecognizedCommandResult(command.name);
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
	buildCustomId = baseCustomId => {
		return `${baseCustomId}${this.messageHandler.algBot.prefix}${this.messageHandler.algBot.language}`;
	};
	buildApplicationCommands = () => {
		let commandsWithoutArgument = CommandHandler.commands
			.filter(command => !command.argumentsExample);
		return [
			...CommandHandler.commands
				.map(command => this.createSlashCommand(command)),
			...commandsWithoutArgument
				.map(command => this.createUserContextMenuCommand(command)),
			...commandsWithoutArgument
				.map(command => this.createMessageContextMenuCommand(command))
		];
	};
	createSlashCommand = commandObject => {
		let slashCommand = new Discord.SlashCommandBuilder()
			.setDescription(commandObject.description[this.messageHandler.algBot.language])
			.setName(commandObject.name);
		if (["alg", "do"].includes(commandObject.name)) {
			this.algCommandHandler.addAlgOrDoSlashCommandOptions(slashCommand);
		}
		return slashCommand;
	};
	createUserContextMenuCommand = commandObject => {
		return new Discord.ContextMenuCommandBuilder()
			.setType(Discord.ApplicationCommandType.User)
			.setName(commandObject.name);
	};
	createMessageContextMenuCommand = commandObject => {
		return new Discord.ContextMenuCommandBuilder()
			.setType(Discord.ApplicationCommandType.Message)
			.setName(commandObject.name);
	};
	areFullCommandsSetsEqual = (currentCommands, newCommands) => {
		let currentSlashCommands = currentCommands.filter(command => command.type === Discord.ApplicationCommandType.ChatInput);
		let newSlashCommands = newCommands.filter(command => command instanceof Discord.SlashCommandBuilder);
		if (!this.areCommandsSetsEqual(currentSlashCommands, newSlashCommands, true)) {
			return false;
		}
		let currentUserCommands = currentCommands.filter(command => command.type === Discord.ApplicationCommandType.User);
		let newUserCommands = newCommands.filter(command => command.type === Discord.ApplicationCommandType.User);
		if (!this.areCommandsSetsEqual(currentUserCommands, newUserCommands, false)) {
			return false;
		}
		let currentMessageCommands = currentCommands.filter(command => command.type === Discord.ApplicationCommandType.Message);
		let newMessageCommands = newCommands.filter(command => command.type === Discord.ApplicationCommandType.Message);
		if (!this.areCommandsSetsEqual(currentMessageCommands, newMessageCommands, false)) {
			return false;
		}
		return true;
	};
	areCommandsSetsEqual = (currentCommands, newCommands, isSlash) => {
		if (currentCommands.length !== newCommands.length) {
			return false;
		}
		currentCommands.sort((firstCommand, secondCommand) => firstCommand.name.localeCompare(secondCommand.name));
		newCommands.sort((firstCommand, secondCommand) => firstCommand.name.localeCompare(secondCommand.name));
		for (let commandIndex = 0; commandIndex < currentCommands.length; commandIndex++) {
			let currentCommand = currentCommands[commandIndex];
			let newCommand = newCommands[commandIndex];
			// check command
			if (currentCommand.name !== newCommand.name) {
				return false;
			}
			if (!isSlash) {
				continue;
			}
			if (currentCommand.description !== newCommand.description) {
				return false;
			}
			if (currentCommand.options?.length || newCommand.options?.length) {
				// check command options
				if (!currentCommand.options?.length || !newCommand.options?.length
					|| currentCommand.options.length !== newCommand.options.length) {
					return false;
				}
				for (let commandOptionIndex = 0; commandOptionIndex < currentCommand.options.length; commandOptionIndex++) {
					let currentCommandOption = currentCommand.options[commandOptionIndex];
					let newCommandOption = newCommand.options[commandOptionIndex];
					if (currentCommandOption.name !== newCommandOption.name
						|| currentCommandOption.description !== newCommandOption.description) {
						return false;
					}
					if (currentCommandOption.choices?.length || newCommandOption.choices?.length) {
						// check command option choices
						if (!currentCommandOption.choices?.length || !newCommandOption.choices?.length
							|| currentCommandOption.choices.length !== newCommandOption.choices.length) {
							return false;
						}
						for (let optionChoiceIndex = 0; optionChoiceIndex < currentCommandOption.choices.length; optionChoiceIndex++) {
							let currentCommandOptionChoice = currentCommandOption.choices[optionChoiceIndex];
							let newCommandOptionChoice = newCommandOption.choices[optionChoiceIndex];
							if (currentCommandOptionChoice.name !== newCommandOptionChoice.name
								|| currentCommandOptionChoice.value !== newCommandOptionChoice.value) {
								return false;
							}
						}
					}
				}
			}
		}
		return true;
	};
};

export {MessageHandler, CommandHandler};
