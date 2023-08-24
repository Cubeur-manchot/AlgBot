"use strict";

import {OptionsHandler} from "./optionsHandler.js";
import {AlgManipulator} from "./algManipulator.js";
import {ImageBuilder} from "./imageBuilder.js";
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
	static textOptionType = "text";
	static optionOptionType = "options";
	static commentOptionType = "comment";
	static optionTypes = [
		AlgCommandHandler.textOptionType,
		AlgCommandHandler.optionOptionType,
		AlgCommandHandler.commentOptionType
	];
	static slashCommandOptions = [
		{
			type: AlgCommandHandler.textOptionType,
			name: {
				english: "alg",
				french: "algo"
			},
			description: {
				english: "Moves of the alg",
				french: "Mouvements de l'algo"
			},
			required: true
		},
		{
			type: AlgCommandHandler.optionOptionType,
			name: {
				english: "view",
				french: "vue"
			},
			description: {
				english: "View angle of the cube",
				french: "Angle de vue du cube"
			},
			choices: OptionsHandler.views.map(view => {return {name: `-${view}`, value: `-${view}`}}),
			required: false
		},
		{
			type: AlgCommandHandler.optionOptionType,
			name: {
				english: "last_layer_set",
				french: "set_du_last_layer"
			},
			description: {
				english: "Last layer stage",
				french: "Étape du last layer"
			},
			choices: OptionsHandler.planViewStages.map(stage => {return {name: `-${stage}`, value: `-${stage}`}}),
			required: false
		},
		{
			type: AlgCommandHandler.optionOptionType,
			name: {
				english: "set_out_of_last_layer",
				french: "set_hors_du_last_layer"
			},
			description: {
				english: "Non last layer stage",
				french: "Étape hors du last layer"
			},
			choices: OptionsHandler.isometricViewStages.map(stage => {return {name: `-${stage}`, value: `-${stage}`}}),
			required: false
		},
		{
			type: AlgCommandHandler.optionOptionType,
			name: {
				english: "moves_counters",
				french: "compteur_de_moves"
			},
			description: {
				english: "Counts the moves in several metrics",
				french: "Compte les moves dans plusieurs métriques"
			},
			choices: [
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
				.map(metricsListString => {return {name: metricsListString, value: metricsListString}}),
			required: false
		},
		{
			type: AlgCommandHandler.optionOptionType,
			name: {
				english: "merge",
				french: "fusion"
			},
			description: {
				english: "Simplifies the moves that merge or cancel",
				french: "Simplifie les mouvements qui fusionnent ou s'annulent "
			},
			choices: [{name: "-merge", value: "-merge"}],
			required: false
		},
		{
			type: AlgCommandHandler.optionOptionType,
			name: {
				english: "orientation",
				french: "orientation"
			},
			description: {
				english: "Orientation of the cube",
				french: "Orientation du cube"
			},
			choices: Object.keys(OptionsHandler.colorSchemes)
				.filter(orientation => orientation.includes("-") || orientation === "yellow")
				.map(orientation => {return {name: `-${orientation}`, value: `-${orientation}`}}),
			required: false
		},
		{
			type: AlgCommandHandler.optionOptionType,
			name: {
				english: "image",
				french: "image"
			},
			description: {
				english: "Specifies the tool to generate the image",
				french: "Spécifie l'outil pour générer l'image"
			},
			choices: OptionsHandler.imageGenerators
				.map(imageGenerator => {return {name: `-${imageGenerator}`, value: `-${imageGenerator}`}}),
			required: false
		},
		{
			type: AlgCommandHandler.commentOptionType,
			name: {
				english: "comment",
				french: "commentaire"
			},
			description: {
				english: "Comment on the alg",
				french: "Commentaire sur l'algo"
			},
			required: false
		}
	];
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.optionsHandler = new OptionsHandler(this);
		this.algManipulator = new AlgManipulator(this);
		this.imageBuilder = new ImageBuilder(this);
		this.embedColor = embedColor;
		let language = this.commandHandler.messageHandler.algBot.language;
		this.invalidOptionsLabel = AlgCommandHandler.invalidOptionsLabel[language];
		this.invalidMoveSequenceLabel = AlgCommandHandler.invalidMoveSequenceLabel[language];
		this.slashCommandOptions = AlgCommandHandler.slashCommandOptions
			.map(option => {return {
				type: option.type,
				name: option.name[language],
				description: option.description[language],
				choices: option.choices,
				required: option.required
			}});
	};
	getAlgOrDoCommandResult = async (moves, options, comment, isDo) => {
		// parse options
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
		parsedOptions.isDo = isDo;
		let cubeSize = parseInt(parsedOptions.puzzle.match(/\d+/)[0]);
		// parse move sequence
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
		let moveSequenceWithLimit = this.applyDiscordEmbedLimits(parsedMoveSequence.moveSequence, AlgCommandHandler.embedSizeLimits.title);
		// merge moves
		if (parsedOptions.mergeMoves) {
			parsedMoveSequence.moveSequence = this.algManipulator.algMerger.mergeMoves(parsedMoveSequence.moveSequence, cubeSize);
		}
		// count moves
		if (Object.values(parsedOptions.countMoves).includes(true)) {
			let moveCounts = this.algManipulator.countMoves(parsedMoveSequence.moveSequence);
			parsedMoveSequence.moveCounts = moveCounts;
		}
		// build image
		let image = parsedOptions.imageGenerator === OptionsHandler.holoCubeImageGenerator
			? await this.imageBuilder.buildHoloCubeImage(parsedMoveSequence.moveSequence, parsedOptions, cubeSize)
			: this.imageBuilder.buildVisualCubeImage(parsedMoveSequence.moveSequence, parsedOptions, cubeSize);
		if (image.errors.length) {
			return {
				message: {
					textContent: this.commandHandler.getErrorMessage(`${this.invalidMoveSequenceLabel}`)
					// todo add Holo-Cube reasons
				},
				error: true
			};
		}
		// build animation link
		let moveSequenceForAlgCubingNetUrl = this.algManipulator.replaceMiddleSliceMoves(parsedMoveSequence.moveSequence, cubeSize)
			.replace(/\s/g, "_") // replace spaces
			.replace(/-/g, "%26%2345%3B"); // replace hyphens
		let algCubingNetUrl = `https://alg.cubing.net/?alg=${moveSequenceForAlgCubingNetUrl}`
			+ (parsedOptions.isDo ? "" : `&setup=(${moveSequenceForAlgCubingNetUrl})%27`)
			+ `&puzzle=${Array(3).fill(cubeSize).join("x")}`;
		// build description
		let moveCounts = parsedMoveSequence.moveCounts
			? `(${Object.keys(parsedMoveSequence.moveCounts)
				.filter(metric => parsedOptions.countMoves[metric] === true)
				.map(metric => `${parsedMoveSequence.moveCounts[metric]} ${metric.toUpperCase()}`)
				.join(", ")
				})`
			: null;
		let commentWithLimit = comment
			? this.applyDiscordEmbedLimits(comment,
				AlgCommandHandler.embedSizeLimits.description - (moveCounts ? moveCounts.length + 1 : 0))
			: null;
		let description = [moveCounts, commentWithLimit]
			.filter(descriptionChunk => descriptionChunk !== null)
			.join("\n");
		// build embed
		let embed = DiscordMessageEmbedBuilder.createEmbed(
			this.embedColor,
			moveSequenceWithLimit,
			algCubingNetUrl,
			description.length ? description : DiscordMessageEmbedBuilder.noDescription,
			DiscordMessageEmbedBuilder.noFields,
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			image.url,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
		return {
			message: {
				embed: embed,
				attachment: image.attachment,
				//components: null, // todo reactivate -rotatable with buttons
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
	addAlgOrDoSlashCommandOptions = slashCommand => {
		for (let slashCommandOption of this.slashCommandOptions) {
			slashCommand.addStringOption(option => {
				option
					.setName(slashCommandOption.name)
					.setDescription(slashCommandOption.description)
					.setRequired(slashCommandOption.required);
				if (slashCommandOption.choices) {
					option.addChoices(...slashCommandOption.choices);
				}
				return option;
			});
		}
	};
};

export {AlgCommandHandler};
