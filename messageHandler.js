"use strict";

import {HelpCommandHandler} from "./helpCommandHandler.js";
import {OptionsHandler} from "./optionsHandler.js";
import {AlgManipulator} from "./algManipulator.js";
import {MessageComponentHandler} from "./messageComponentHandler.js";

class MessageHandler {
	constructor(algBot) {
		this.algBot = algBot;
		this.commandHandler = new CommandHandler(this);
	};
	onMessageCreate = message => {
		if (this.messageIsAlgBotCommand(message) && !this.messageIsInThreadWithoutAlgBot(message)) {
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
	messageIsInThreadWithoutAlgBot = message => {
		return this.algBot.discordClient.channelIsThread(message.channel)
			&& message.channel.members.cache.get(message.client.user.id) === undefined;
	};
};

class CommandHandler {
	static embedColors = {
		help: 0xcccc00, // yellow
		alg: 0x0099ff // blue
	};
	static unrecognizedCommandLabel = {
		english: "Unrecognized command",
		french: "Commande non reconnue"
	};
	static invalidOptionsLabel = {
		english: "Invalid option(s)",
		french: "Option(s) incorrecte(s)"
	};
	static invalidMoveSequence = {
		english: "Invalid move sequence",
		french: "Algorithme incorrect"
	};
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
		this.helpCommandHandler = new HelpCommandHandler(this, CommandHandler.embedColors.help);
		this.algCommandHandler = new AlgCommandHandler(this, CommandHandler.embedColors.alg);
		this.componentsHandler = new MessageComponentHandler(this);
		let language = messageHandler.algBot.language;
		this.unrecognizedCommandLabel = CommandHandler.unrecognizedCommandLabel[language];
		this.invalidOptionsLabel = CommandHandler.invalidOptionsLabel[language];
		this.invalidMoveSequence = CommandHandler.invalidMoveSequence[language];
	};
	getCommandResult = message => {
		let commandHeader = message.content.split(" ")[0];
		switch (commandHeader.substring(1)) {
			case "help":
				return this.helpCommandHandler.getHelpCommandResult();
			case "alg":
				return this.algCommandHandler.getAlgOrDoCommandResult(message.content, false);
			case "do":
				return this.algCommandHandler.getAlgOrDoCommandResult(message.content, true);
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
		return {
			message: {
			},
			error: false
		};
	};
	onInteractionCreate = interaction => {
		if (!this.messageHandler.messageIsAlgBotMessage(interaction.message)) {
			return;
		}
		if (interaction.customId === HelpCommandHandler.helpSelectOptionCustomId) {
			this.helpCommandHandler.handleHelpStringSelectInteraction(interaction);
		}
		}
	};
};

/*
todo reactivate
const rotationToAddList = ["x", "x'", "y", "y'", "z", "z'",];
const planViewRotationReactionList = ["⬆", "⬇", "↩", "↪", "➡", "⬅"];
const isometricViewRotationReactionList = ["↗", "↙", "⬅", "➡", "↘", "↖"];
embed.image.url += rotationToAdd; // simply add the rotation at the end
*/

class AlgCommandHandler {
	static embedSizeLimits = {
		title: 256,
		description: 4096
	};
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.optionsHandler = new OptionsHandler(this);
		this.algManipulator = new AlgManipulator(this);
		this.embedColor = embedColor;
	};
	getAlgOrDoCommandResult = (command, isDo) => {
		let [, moves, options, comment] = command
			.replace(/(?<!\s.*)\s/, "  ")
			.split(/(?<!\s.*)\s|(?<!\s-.*|\/\/.*)\s+(?=-|\/\/)|(?<!\/\/.*)\s*\/\/\s*/);
		let parsedOptions = this.optionsHandler.parseOptions(options ?? "");
		if (parsedOptions.errors.length) {
			return {
				message: {
					textContent: this.getErrorMessage(`${this.invalidOptionsLabel} :\n`
						+ parsedOptions.errors.map(error => `${error.message} : ${error.option}`).join(".\n"))
				},
				error: true
			};
		}
		let parsedMoveSequence = this.algManipulator.parseMoveSequence(moves ?? "");
		if (parsedMoveSequence.errors.length) {
			return {
				message: {
					textContent: this.getErrorMessage(`${this.invalidMoveSequence} :\n`
						+ parsedMoveSequence.errors.map(error => `${error.message}${error.scope ? ` : ${error.scope}` : ""}`).join(".\n"))
				},
				error: true
			};
		}
		parsedOptions.isDo = isDo;
		if (parsedOptions.mergeMoves) {
			let cubeSize = parseInt(parsedOptions.puzzle.match(/\d+/)[0]);
			parsedMoveSequence.moveSequence = this.algManipulator.algMerger.mergeMoves(parsedMoveSequence.moveSequence, cubeSize);
		}
		if (Object.values(parsedOptions.countMoves).includes(true)) {
			let moveCounts = this.algManipulator.countMoves(parsedMoveSequence.moveSequence);
			parsedMoveSequence.moveCounts = moveCounts;
		}
		parsedMoveSequence.comment = comment;
		return {
			message: {
				textContent: null,
				embed: this.createAlgEmbed(parsedMoveSequence, parsedOptions),
				components: null, // todo reactivate -rotatable with buttons
				reactions: ["❤", "💩", "🥇", "👽"]
			},
			error: false
		};
	};
	applyDiscordEmbedLimits = (fieldValue, discordLimit) => {
		return fieldValue.length <= discordLimit
			? fieldValue
			: `${fieldValue.substring(0, discordLimit - 3)}...`;
	};
	createAlgEmbed = (moveSequenceObject, optionsObject) => {
		let moveSequenceWithLimit = this.applyDiscordEmbedLimits(moveSequenceObject.moveSequence, AlgCommandHandler.embedSizeLimits.title);
		let cube = optionsObject.puzzle.replace("cube", "");
		let commentWithLimit = moveSequenceObject.comment
			? this.applyDiscordEmbedLimits(moveSequenceObject.comment, AlgCommandHandler.embedSizeLimits.description)
			: null;
		let moveCounts = moveSequenceObject.moveCounts
			? Object.keys(moveSequenceObject.moveCounts)
				.filter(metric => optionsObject.countMoves[metric] === true)
				.map(metric => `${moveSequenceObject.moveCounts[metric]} ${metric.toUpperCase()}`)
			: null;
		let cubeSize = parseInt(cube.match(/\d+/)[0]);
		let moveSequenceForAlgCubingNet =
			this.algManipulator.replaceMiddleSliceMoves(moveSequenceObject.moveSequence, cubeSize);
		let moveSequenceForAlgCubingNetUrl = moveSequenceForAlgCubingNet
			.replace(/\s/g, "_") // replace spaces
			.replace(/-/g, "%26%2345%3B"); // replace hyphen characters
		let visualCubeImageUrl = this.buildVisualCubeUrl(moveSequenceForAlgCubingNet, moveSequenceObject, optionsObject);
		let algCubingNetUrl = `https://alg.cubing.net/?alg=${moveSequenceForAlgCubingNetUrl}`
			+ (optionsObject.isDo ? "" : `&setup=(${moveSequenceForAlgCubingNetUrl})%27`)
			+ `&puzzle=${cube}`;
		return {
			color: this.embedColor,
			title: moveSequenceWithLimit,
			url: algCubingNetUrl,
			description: `${moveCounts ? `(${moveCounts.join(", ")})` : ""}${moveCounts || commentWithLimit ? "\n" : ""}${commentWithLimit ?? ""}`,
			image: {
				url: visualCubeImageUrl
			}
		};
	};
	buildVisualCubeUrl = (moveSequence, moveSequenceObject, optionsObject) => {
		let moveSequenceForVisualCube =
			this.algManipulator.replaceInnerSliceMoves(moveSequence)
			.replace(/\s/g, "%20") // replace spaces
			.replace(/'/g, "%27"); // replace apostrophes
		let caseOrAlg = optionsObject.isDo ? "alg" : "case";
		let stage = optionsObject.stage;
		let view = optionsObject.view === OptionsHandler.planView ? "&view=plan" : "";
		let puzzle = optionsObject.puzzle.match(/\d+/)[0];
		let colorScheme = [
			optionsObject.colorScheme.U,
			optionsObject.colorScheme.R,
			optionsObject.colorScheme.F,
			optionsObject.colorScheme.D,
			optionsObject.colorScheme.L,
			optionsObject.colorScheme.B]
			.map(color => color[0]) // keep first letter only
			.join("");
		let urlBegin = "http://cube.rider.biz/visualcube.php?fmt=png&bg=t&size=150";
		return `${urlBegin}${view}&pzl=${puzzle}&sch=${colorScheme}&stage=${stage}&${caseOrAlg}=${moveSequenceForVisualCube}`;
	};
};

export {MessageHandler};
