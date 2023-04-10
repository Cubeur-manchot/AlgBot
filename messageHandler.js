"use strict";

import {OptionsHandler} from "./optionsHandler.js";
import {MessageComponentHandler} from "./messageComponentHandler.js";

class MessageHandler {
	constructor(algBot) {
		this.algBot = algBot;
		this.commandHandler = new CommandHandler(this);
		this.embedHandler = new MessageEmbedHandler(this);
		this.componentsHandler = new MessageComponentHandler(this);
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
	onInteractionCreate = interaction => {
		if (!this.messageIsAlgBotMessage(interaction.message)) {
			return;
		}
		if (interaction.isStringSelectMenu()) { // string select with help command
			let interactionValue = interaction.values[0];
			interaction.update({
				embeds: [this.embedHandler[`${interactionValue}HelpEmbed`]],
				components: this.componentsHandler.createHelpComponents(interactionValue)
			})
			.catch(interactionCreateError => this.algBot.logger.errorLog(
				`Fail to create interaction on StringSelect component for AlgBot (${this.algBot.language}) : "${interactionCreateError}".`
			))
		}
		//else if (interaction.isButton()) { ... }
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
		this.optionsHandler = new OptionsHandler(this);
		this.unrecognizedCommandLabel = CommandHandler.unrecognizedCommandLabel[messageHandler.algBot.language];
		this.invalidOptionsLabel = CommandHandler.invalidOptionsLabel[messageHandler.algBot.language];
		this.invalidMoveSequence = CommandHandler.invalidMoveSequence[messageHandler.algBot.language];
	};
	getCommandResult = message => {
		let commandHeader = message.content.split(" ")[0];
		switch (commandHeader.substring(1)) {
			case "help":
				return this.getHelpCommandResult();
			case "alg":
			case "do":
				return this.getAlgOrDoCommandResult(message.content);
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
				textContent: null,
				embed: this.messageHandler.embedHandler.generalHelpEmbed,
				components: this.messageHandler.componentsHandler.createHelpComponents("general")
			},
			error: false
		};
	};
	getAlgOrDoCommandResult = command => {
		let [commandHeader, moves, options, comment] = command
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
		let parsedMoveSequence = this.messageHandler.algBot.algManipulator.parseMoveSequence(moves ?? "");
		if (parsedMoveSequence.errors.length) {
			return {
				message: {
					textContent: this.getErrorMessage(`${this.invalidMoveSequence} :\n`
						+ parsedMoveSequence.errors.map(error => `${error.message}${error.scope ? ` : ${error.scope}` : ""}`).join(".\n"))
				},
				error: true
			};
		}
		parsedOptions.isDo = commandHeader.endsWith("do");
		if (parsedOptions.mergeMoves) {
			let cubeSize = parseInt(parsedOptions.puzzle.match(/\d+/)[0]);
			parsedMoveSequence.moveSequence = this.messageHandler.algBot.algManipulator.algMerger.mergeMoves(parsedMoveSequence.moveSequence, cubeSize);
		}
		if (Object.values(parsedOptions.countMoves).includes(true)) {
			let moveCounts = this.messageHandler.algBot.algManipulator.countMoves(parsedMoveSequence.moveSequence);
			parsedMoveSequence.moveCounts = moveCounts;
		}
		parsedMoveSequence.comment = comment;
		return {
			message: {
				textContent: null,
				embed: this.messageHandler.embedHandler.createAlgEmbed(parsedMoveSequence, parsedOptions),
				components: null, // todo reactivate -rotatable with buttons
				reactions: ["❤", "💩", "🥇", "👽"]
			},
			error: false
		};
	};
};

class MessageEmbedHandler {
	static embedSizeLimits = {
		title: 256,
		description: 4096
	};
	static generalHelpEmbedTitle = {
		english: "Help",
		french: "Aide"
	};
	static generalHelpEmbedMessage = {
		english:
			"I'm a :robot: that displays <:3x3solved:708049634349547531> images\n"
			+ "\n`$alg` : displays the case that the alg solves```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$do` : applies the alg on a solved cube and displays the result```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$help` : displays this help, and gives the possibility to display the recognized algs and supported option```parser3\n$help```"
			+ "\nIf the command is edited/deleted, I'll automatically adapt my answer.\n"
			+ "\nIf a command is not correct, I'll send an error message,"
			+ " and I'll delete the command after 10 seconds to clean the channel.\n"
			+ "\nIf you find a bug, please send a PM to Cubeur-manchot#7706 so he can repair me :wrench:",
		french:
			"Je suis un :robot: qui affiche des images de <:3x3solved:708049634349547531>\n"
			+ "\n`$alg` : affiche le cas que l'algo résout```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$do` : applique l'algo sur un cube résolu et affiche le résultat```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$help` : affiche cette aide, et donne la possibilité d'afficher les algos reconnus et les options supportées```parser3\n$help```"
			+ "\nSi la commande est modifiée ou supprimée, j'adapte automatiquement ma réponse.\n"
			+ "\nSi une commande n'est pas bonne, j'envoie un message d'erreur dans le chan,"
			+ " et je supprime la commande au bout de 10 secondes pour faire le ménage.\n"
			+ "\nSi vous me trouvez un bug, merci d'envoyer un MP à Cubeur-manchot#7706 pour qu'il puisse me réparer :wrench:"
	};
	static algListHelpEmbedTitle = {
		english: "Alg list",
		french: "Liste des algos"
	};
	static algListHelpEmbedMessage = {
		english:
			"Here are the recognized algs :\n"
			+ "\nAll the PLL : `PLL_Aa`, `PLL_Ab`, `PLL_E`, `PLL_F`, `PLL_Ga`, `PLL_Gb`, `PLL_Gc`, `PLL_Gd`, `PLL_H`, `PLL_Ja`, `PLL_Jb`, "
			+ "`PLL_Na`, `PLL_Nb`, `PLL_Ra`, `PLL_Rb`, `PLL_T`, `PLL_Ua`, `PLL_Ub`, `PLL_V`, `PLL_Y`, `PLL_Z` :"
			+ "```parser3\n$alg R' PLL_Y R```"
			+ "\nAll the OLL : `OLL_1`, `OLL_2`, ..., `OLL_57` :"
			+ "```parser3\n$alg OLL_37 -oll```"
			+ "\nAll the CMLL : `CMLL_Hnoswap`, `CMLL_ASdiag`, `CMLL_Lright`, ... :"
			+ "```parser3\n$alg CMLL_Hnoswap -cmll```"
			+ "\nSunes, antisunes and compositions of them, niklas :"
			+ "```parser3\n$alg tripleantisune niklasright```"
			+ "\n<:4x4x4:751139156863877251> parities :"
			+ "```parser3\n$alg ollparity pllparity pllparitybigcubes -4```"
			+ "\nUsual triggers and compositions of them :"
			+ "```parser3\n$alg F triplesexy F' hedge antisexy sledge```"
			+ "\nCommutators, conjugates and multiples are also supported :"
			+ "```parser3\n$alg F (sexy)3' F' [R' U' : [R', F]]```",
		french: 
			"Voici les algos reconnus :\n"
			+ "\nToutes les PLL : `PLL_Aa`, `PLL_Ab`, `PLL_E`, `PLL_F`, `PLL_Ga`, `PLL_Gb`, `PLL_Gc`, `PLL_Gd`, `PLL_H`, `PLL_Ja`, `PLL_Jb`, "
			+ "`PLL_Na`, `PLL_Nb`, `PLL_Ra`, `PLL_Rb`, `PLL_T`, `PLL_Ua`, `PLL_Ub`, `PLL_V`, `PLL_Y`, `PLL_Z` :"
			+ "```parser3\n$alg R' PLL_Y R```"
			+ "\nToutes les OLL : `OLL_1`, `OLL_2`, ..., `OLL_57` :"
			+ "```parser3\n$alg OLL_37 -oll```"
			+ "\nToutes les CMLL : `CMLL_Hnoswap`, `CMLL_ASdiag`, `CMLL_Lright`, ... :"
			+ "```parser3\n$alg CMLL_Hnoswap -cmll```"
			+ "\nLes sunes, antisunes et composés, les niklas :"
			+ "```parser3\n$alg tripleantisune niklasright```"
			+ "\nLes parités du <:4x4x4:751139156863877251> :"
			+ "```parser3\n$alg ollparity pllparity pllparitybigcubes -4```"
			+ "\nLes triggers usuels et composés :"
			+ "```parser3\n$alg F triplesexy F' hedge antisexy sledge```"
			+ "\nLes commutateurs, conjugués et multiples sont également supportés :"
			+ "```parser3\n$alg F (sexy)3' F' [R' U' : [R', F]]```"
	};
	static optionsHelpEmbedTitle = {
		english: "Options",
		french: "Options"
	};
	static optionsHelpEmbedMessage = {
		english:
			"Here are the supported options :\n"
			+ "\n`-puzzle` : allows to display the alg on a puzzle other than 3x3 :"
			+ "```yaml\n$alg Lw' U2 Lw' U2 F2 Lw' F2 Rw U2 Rw' U2' Lw2' -5```"
			+ "Valid puzzles : all cubes from 1 to 10.\n"
			+ "\n`-stage` : hides some stickers of the cube to show a precise step :"
			+ "```yaml\n$alg R' F R U R' U' F' U R -oll```"
			+ "Valid stages :\n"
			+ "`cll`, `cmll`, `coll`, `ell`, `ll`, `ocll`, `ocell`, `oell`, `oll`, `ollcp`, `pll`, `wv`, `zbll`, `1lll` (apply a \"plan\" view)\n"
			+ "`cls`, `cols`, `cross`, `els`, `fl`, `f2b`, `f2l`, `f2l_1`, `f2l_2`, `f2l_sm`, `f2l_3`, `line`, `vh`, `vls`, `zbls`, `2x2x2`, `2x2x3` (apply a \"normal\" view)\n"
			+ "\n`-view` : allows to change the view :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -normal```"
			+ "Valid views : plan, normal, trans.\n"
			+ "\n`-yellow`, `-yellow-orange` : displays the cube with first color on top and second color on front (default : white on top, green on front) :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm`, `-qtm` : count moves with specified metrics (`-count` : count with all metrics) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : merge and cancel moves if possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```"
			+ "\n`-rotatable` : enables to rotate the cube by clicking on the reactions"
			+ "```yaml\n$alg sune -rotatable```",
		french:
			"Voici les options que je prends en charge :\n"
			+ "\n`-puzzle` : permet d'afficher l'algo sur un puzzle autre que 3x3 :"
			+ "```yaml\n$alg Lw' U2 Lw' U2 F2 Lw' F2 Rw U2 Rw' U2' Lw2' -5```"
			+ "Puzzles valides : tous les cubes de 1 à 10.\n"
			+ "\n`-stage` : masque certains stickers du cube pour faire apparaître une étape précise :"
			+ "```yaml\n$alg R' F R U R' U' F' U R -oll```"
			+ "Stages valides :\n"
			+ "`cll`, `cmll`, `coll`, `ell`, `ll`, `ocll`, `ocell`, `oell`, `oll`, `ollcp`, `pll`, `wv`, `zbll`, `1lll` (appliquent une vue \"plan\")\n"
			+ "`cls`, `cols`, `cross`, `els`, `fl`, `f2b`, `f2l`, `f2l_1`, `f2l_2`, `f2l_sm`, `f2l_3`, `line`, `vh`, `vls`, `zbls`, `2x2x2`, `2x2x3` (appliquent une vue \"normal\")\n"
			+ "\n`-view` : permet de modifier la vue :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -normal```"
			+ "Vues valides : plan, normal, trans.\n"
			+ "\n`-yellow`, `-yellow-orange` : affiche le cube avec la première couleur en haut et la deuxième couleur devant (par défaut : blanc en haut, vert devant) :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm`, `-qtm` : compte les mouvements avec la métrique demandée (`-count` : compte avec toutes les métriques) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : fusionne et annule les mouvements si possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```"
			+ "\n`-rotatable` : permet de faire tourner le cube en cliquant sur les réactions"
			+ "```yaml\n$alg sune -rotatable```"
	};
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
		this.generalHelpEmbed = {
			color: CommandHandler.embedColors.help,
			title: MessageEmbedHandler.generalHelpEmbedTitle[this.messageHandler.algBot.language],
			description: MessageEmbedHandler.generalHelpEmbedMessage[this.messageHandler.algBot.language]
		};
		this.algListHelpEmbed = {
			color: CommandHandler.embedColors.help,
			title: MessageEmbedHandler.algListHelpEmbedTitle[this.messageHandler.algBot.language],
			description: MessageEmbedHandler.algListHelpEmbedMessage[this.messageHandler.algBot.language]
		};
		this.optionsHelpEmbed = {
			color: CommandHandler.embedColors.help,
			title: MessageEmbedHandler.optionsHelpEmbedTitle[this.messageHandler.algBot.language],
			description: MessageEmbedHandler.optionsHelpEmbedMessage[this.messageHandler.algBot.language]
		};
	};
	createAlgEmbed = (moveSequenceObject, optionsObject) => {
		let moveSequenceWithLimit = this.applyDiscordEmbedLimits(moveSequenceObject.moveSequence, MessageEmbedHandler.embedSizeLimits.title);
		let cube = optionsObject.puzzle.replace("cube", "");
		let commentWithLimit = moveSequenceObject.comment
			? this.applyDiscordEmbedLimits(moveSequenceObject.comment, MessageEmbedHandler.embedSizeLimits.description)
			: null;
		let moveCounts = moveSequenceObject.moveCounts
			? Object.keys(moveSequenceObject.moveCounts)
				.filter(metric => optionsObject.countMoves[metric] === true)
				.map(metric => `${moveSequenceObject.moveCounts[metric]} ${metric.toUpperCase()}`)
			: null;
		let cubeSize = parseInt(cube.match(/\d+/)[0]);
		let moveSequenceForAlgCubingNet =
			this.messageHandler.algBot.algManipulator.replaceMiddleSliceMoves(moveSequenceObject.moveSequence, cubeSize);
		let moveSequenceForAlgCubingNetUrl = moveSequenceForAlgCubingNet
			.replace(/\s/g, "_") // replace spaces
			.replace(/-/g, "%26%2345%3B"); // replace hyphen characters
		let visualCubeImageUrl = this.buildVisualCubeUrl(moveSequenceForAlgCubingNet, moveSequenceObject, optionsObject);
		let algCubingNetUrl = `https://alg.cubing.net/?alg=${moveSequenceForAlgCubingNetUrl}`
			+ (optionsObject.isDo ? "" : `&setup=(${moveSequenceForAlgCubingNetUrl})%27`)
			+ `&puzzle=${cube}`;
		return {
			color: CommandHandler.embedColors.alg,
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
			this.messageHandler.algBot.algManipulator.replaceInnerSliceMoves(moveSequence)
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
	applyDiscordEmbedLimits = (fieldValue, discordLimit) => {
		return fieldValue.length <= discordLimit
			? fieldValue
			: `${fieldValue.substring(0, discordLimit - 3)}...`;
	};
};

export {MessageHandler};
