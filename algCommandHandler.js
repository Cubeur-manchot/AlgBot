"use strict";

import {OptionsHandler} from "./optionsHandler.js";
import {AlgManipulator} from "./algManipulator.js";

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
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.optionsHandler = new OptionsHandler(this);
		this.algManipulator = new AlgManipulator(this);
		this.embedColor = embedColor;
		let language = this.commandHandler.messageHandler.algBot.language;
		this.invalidOptionsLabel = AlgCommandHandler.invalidOptionsLabel[language];
		this.invalidMoveSequenceLabel = AlgCommandHandler.invalidMoveSequenceLabel[language];
	};
	getAlgOrDoCommandResult = (command, isDo) => {
		let [, moves, options, comment] = command
			.replace(/(?<!\s.*)\s/, "  ")
			.split(/(?<!\s.*)\s|(?<!\s-.*|\/\/.*)\s+(?=-|\/\/)|(?<!\/\/.*)\s*\/\/\s*/);
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
		let visualCubeImageUrl = this.buildVisualCubeUrl(moveSequenceForAlgCubingNet, optionsObject);
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
};

export {AlgCommandHandler};
