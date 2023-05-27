"use strict";

import {OptionsHandler} from "./optionsHandler.js";
import {AlgManipulator} from "./algManipulator.js";
import {DiscordMessageEmbedBuilder} from "./discordUtils/discordMessageEmbedBuilder.js";

class AlgCommandHandler {
	static embedSizeLimits = {
		title: 256,
		description: 4096
	};
	static invalidOptionsLabel = {
		english: "Invalid option(s)",
		french: "Option(s) incorrecte(s)"
	};
	static invalidMoveSequenceLabel = {
		english: "Invalid move sequence",
		french: "Algorithme incorrect"
	};
	static movesOptionName = {
		english: "alg",
		french: "algo"
	};
	static movesOptionDescription = {
		english: "Moves of the alg",
		french: "Mouvements de l'algo"
	};
	static viewOptionName = {
		english: "view",
		french: "vue"
	};
	static viewOptionDescription = {
		english: "View angle of the cube",
		french: "Angle de vue du cube"
	};
	static lastLayerStageOptionName = {
		english: "last_layer_set",
		french: "set_du_last_layer"
	};
	static lastLayerStageOptionDescription = {
		english: "Shows a state of the last layer",
		french: "Montre un état du last layer"
	};
	static otherStageOptionName = {
		english: "set_out_of_last_layer",
		french: "set_hors_du_last_layer"
	};
	static otherStageOptionDescription = {
		english: "Shows a non last layer stage",
		french: "Montre une étape hors du last layer"
	};
	static countMovesOptionName = {
		english: "moves_counters",
		french: "compteur_de_moves"
	};
	static countMovesOptionDescription = {
		english: "Counts the moves in several metrics",
		french: "Compte les moves dans plusieurs métriques"
	};
	static orientationOptionName = {
		english: "orientation",
		french: "orientation"
	};
	static orientationOptionDescription = {
		english: "Orientation of the cube",
		french: "Orientation du cube"
	};
	static commentOptionName = {
		english: "comment",
		french: "commentaire"
	};
	static commentOptionDescription = {
		english: "Comment on the alg, must start with a double slash : //",
		french: "Commentaire sur l'algo, doit commencer avec un double slash : //"
	};
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.optionsHandler = new OptionsHandler(this);
		this.algManipulator = new AlgManipulator(this);
		this.embedColor = embedColor;
		let language = this.commandHandler.messageHandler.algBot.language;
		this.invalidOptionsLabel = AlgCommandHandler.invalidOptionsLabel[language];
		this.invalidMoveSequenceLabel = AlgCommandHandler.invalidMoveSequenceLabel[language];
		this.movesOptionName = AlgCommandHandler.movesOptionName[language];
		this.movesOptionDescription = AlgCommandHandler.movesOptionDescription[language];
		this.viewOptionName = AlgCommandHandler.viewOptionName[language];
		this.viewOptionDescription = AlgCommandHandler.viewOptionDescription[language];
		this.lastLayerStageOptionName = AlgCommandHandler.lastLayerStageOptionName[language];
		this.lastLayerStageOptionDescription = AlgCommandHandler.lastLayerStageOptionDescription[language];
		this.otherStageOptionName = AlgCommandHandler.otherStageOptionName[language];
		this.otherStageOptionDescription = AlgCommandHandler.otherStageOptionDescription[language];
		this.countMovesOptionName = AlgCommandHandler.countMovesOptionName[language];
		this.countMovesOptionDescription = AlgCommandHandler.countMovesOptionDescription[language];
		this.orientationOptionName = AlgCommandHandler.orientationOptionName[language];
		this.orientationOptionDescription = AlgCommandHandler.orientationOptionDescription[language];
		this.commentOptionName = AlgCommandHandler.commentOptionName[language];
		this.commentOptionDescription = AlgCommandHandler.commentOptionDescription[language];
	};
	getAlgOrDoCommandResult = (moves, options, comment, isDo) => {
		let parsedOptions = this.optionsHandler.parseOptions(options ?? "");
		if (parsedOptions.errors.length) {
			return {
				message: {
					textContent: this.commandHandler.getErrorMessage(`${this.invalidOptionsLabel} :\n`
						+ parsedOptions.errors.map(error => `${error.message} : ${error.option}`).join(".\n"))
				},
				error: true
			};
		}
		let parsedMoveSequence = this.algManipulator.parseMoveSequence(moves ?? "");
		if (parsedMoveSequence.errors.length) {
			return {
				message: {
					textContent: this.commandHandler.getErrorMessage(`${this.invalidMoveSequenceLabel} :\n`
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
		let cubeSize = parseInt(cube.match(/\d+/)[0]);
		let moveSequenceForAlgCubingNet =
			this.algManipulator.replaceMiddleSliceMoves(moveSequenceObject.moveSequence, cubeSize);
		let moveSequenceForAlgCubingNetUrl = moveSequenceForAlgCubingNet
			.replace(/\s/g, "_") // replace spaces
			.replace(/-/g, "%26%2345%3B"); // replace hyphen characters
		let visualCubeImageUrl = this.buildVisualCubeUrl(moveSequenceForAlgCubingNet, optionsObject);
		let algCubingNetUrl = `https://alg.cubing.net/?alg=${moveSequenceForAlgCubingNetUrl}`
			+ (optionsObject.isDo ? "" : `&setup=(${moveSequenceForAlgCubingNetUrl})%27`)
			+ `&puzzle=${cube}`;
		let commentWithLimit = moveSequenceObject.comment
			? this.applyDiscordEmbedLimits(moveSequenceObject.comment, AlgCommandHandler.embedSizeLimits.description)
			: null;
		let moveCounts = moveSequenceObject.moveCounts
			? `(${Object.keys(moveSequenceObject.moveCounts)
				.filter(metric => optionsObject.countMoves[metric] === true)
				.map(metric => `${moveSequenceObject.moveCounts[metric]} ${metric.toUpperCase()}`)
				.join(", ")
				})`
			: null;
		let description = [moveCounts, commentWithLimit]
			.filter(descriptionChunk => descriptionChunk !== null)
			.join("\n");
		return DiscordMessageEmbedBuilder.createEmbed(
				this.embedColor,
				moveSequenceWithLimit,
				algCubingNetUrl,
				description.length ? description : DiscordMessageEmbedBuilder.noDescription,
				DiscordMessageEmbedBuilder.noFields,
				DiscordMessageEmbedBuilder.noThumbnailUrl,
				visualCubeImageUrl,
				DiscordMessageEmbedBuilder.noFooterTextContent
			);
	};
	buildVisualCubeUrl = (moveSequence, optionsObject) => {
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
	addAlgOrDoSlashCommandOptions = slashCommand => {
		slashCommand.addStringOption(option => option // moves
			.setName(this.movesOptionName)
			.setDescription(this.movesOptionDescription)
			.setRequired(true)
		);
		slashCommand.addStringOption(option => option // view angle
			.setName(this.viewOptionName)
			.setDescription(this.viewOptionDescription)
			.addChoices(...OptionsHandler.views.map(view => {return {name: `-${view}`, value: `-${view}`}}))
			.setRequired(false)
		);
		slashCommand.addStringOption(option => option // stage (last layer)
			.setName(this.lastLayerStageOptionName)
			.setDescription(this.lastLayerStageOptionDescription)
			.addChoices(...OptionsHandler.planViewStages.map(stage => {return {name: `-${stage}`, value: `-${stage}`}}))
			.setRequired(false)
		);
		slashCommand.addStringOption(option => option // stage (not last layer)
			.setName(this.otherStageOptionName)
			.setDescription(this.otherStageOptionDescription)
			.addChoices(...OptionsHandler.isometricViewStages.map(stage => {return {name: `-${stage}`, value: `-${stage}`}}))
			.setRequired(false)
		);
		slashCommand.addStringOption(option => option // move counters
			.setName(this.countMovesOptionName)
			.setDescription(this.countMovesOptionDescription)
			.addChoices(...[
					["count"],
					[OptionsHandler.metrics[0]],
					[OptionsHandler.metrics[1]],
					[OptionsHandler.metrics[2]],
					[OptionsHandler.metrics[3]],
					[OptionsHandler.metrics[0], OptionsHandler.metrics[1]],
					[OptionsHandler.metrics[0], OptionsHandler.metrics[2]],
					[OptionsHandler.metrics[0], OptionsHandler.metrics[3]],
					[OptionsHandler.metrics[1], OptionsHandler.metrics[2]],
					[OptionsHandler.metrics[1], OptionsHandler.metrics[3]],
					[OptionsHandler.metrics[2], OptionsHandler.metrics[3]],
					[OptionsHandler.metrics[0], OptionsHandler.metrics[1], OptionsHandler.metrics[2]],
					[OptionsHandler.metrics[0], OptionsHandler.metrics[1], OptionsHandler.metrics[3]],
					[OptionsHandler.metrics[0], OptionsHandler.metrics[2], OptionsHandler.metrics[3]],
					[OptionsHandler.metrics[1], OptionsHandler.metrics[2], OptionsHandler.metrics[3]]
				]
				.map(metricsList => metricsList.map(metric => `-${metric}`).join(" "))
				.map(metricsListString => {return {name: metricsListString, value: metricsListString}})
			)
			.setRequired(false)
		);
		slashCommand.addStringOption(option => option // orientation
			.setName(this.orientationOptionName)
			.setDescription(this.orientationOptionDescription)
			.addChoices(...Object.keys(OptionsHandler.colorSchemes)
				.filter(orientation => orientation.includes("-") || orientation === "yellow")
				.map(orientation => {return {name: `-${orientation}`, value: `-${orientation}`}}))
			.setRequired(false)
		);
		slashCommand.addStringOption(option => option // comment
			.setName(this.commentOptionName)
			.setDescription(this.commentOptionDescription)
			.setRequired(false)
		);
	};
};

export {AlgCommandHandler};
