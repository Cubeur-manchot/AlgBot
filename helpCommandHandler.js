"use strict";

import {CommandHandler} from "./messageHandler.js";
import {OptionsHandler} from "./optionsHandler.js";
import {DiscordMessageComponentBuilder} from "./discordUtils/discordMessageComponentBuilder.js";
import {DiscordMessageEmbedBuilder} from "./discordUtils/discordMessageEmbedBuilder.js";

class HelpCommandHandler {
	static helpSelectOptionCustomId = "helpSelectOption";
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		let language = this.commandHandler.messageHandler.algBot.language;
		let prefix = this.commandHandler.messageHandler.algBot.prefix;
		let highlightLanguage = "tcl";
		this.commandsHelpEmbed = CommandsHelpEmbedBuilder.buildEmbed(embedColor, language, prefix, highlightLanguage);
		this.algListHelpEmbed = AlgListHelpEmbedBuilder.buildEmbed(embedColor, language, prefix, highlightLanguage);
		this.optionsHelpEmbed = OptionsHelpEmbedBuilder.buildEmbed(embedColor, language, prefix, highlightLanguage);
		this.interactionHelpEmbed = InteractionHelpEmbedBuilder.buildEmbed(embedColor, language, prefix);
		this.selectOptions = [
			{label: CommandsHelpEmbedBuilder.embedTitle[language], emoji: "💡", value: "commands"},
			{label: AlgListHelpEmbedBuilder.embedTitle[language], emoji: "📖", value: "algList"},
			{label: OptionsHelpEmbedBuilder.embedTitle[language], emoji: "🔧", value: "options"},
			{label: InteractionHelpEmbedBuilder.embedTitle[language], emoji: "↔", value: "interaction"},
		];
		this.helpSelectOptionCustomId = this.commandHandler.buildCustomId(HelpCommandHandler.helpSelectOptionCustomId);
	};
	getHelpCommandResult = () => {
		return {
			message: {
				textContent: "",
				embed: this.commandsHelpEmbed,
				components: DiscordMessageComponentBuilder.createRowWithSelectComponents(
					this.selectOptions, this.selectOptions[0].value, this.helpSelectOptionCustomId)
			},
			error: false
		};
	};
	handleHelpStringSelectInteraction = interaction => {
		let interactionValue = interaction.values[0];
		this.commandHandler.messageHandler.algBot.discordClient.updateInteractionMessage(interaction, {
			embed: this[`${interactionValue}HelpEmbed`],
			components: DiscordMessageComponentBuilder.createRowWithSelectComponents(this.selectOptions, interactionValue, this.helpSelectOptionCustomId)
		});
	};
};

class CommandsHelpEmbedBuilder {
	static embedTitle = {
		english: "Commands",
		french: "Commandes"
	};
	static headerLabel = {
		english: "I'm a :robot: that displays images of",
		french: "Je suis un :robot: qui affiche des images de"
	};
	static buildEmbed = (embedColor, language, prefix, highlightLanguage) => {
		return DiscordMessageEmbedBuilder.createEmbed(
			embedColor,
			CommandsHelpEmbedBuilder.embedTitle[language],
			DiscordMessageEmbedBuilder.noTitleUrl,
			`${CommandsHelpEmbedBuilder.headerLabel[language]} <:3x3solved:708049634349547531>`,
			CommandHandler.commands
				.map(command => {return {
					name: `\`${prefix}${command.name}\``,
					value: `${command.description[language]}\`\`\`${highlightLanguage}\n${prefix}${command.name}${command.argumentsExample ? ` ${command.argumentsExample}` : ""}\`\`\``
				}}),
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
	};
};

class AlgListHelpEmbedBuilder {
	static embedTitle = {
		english: "Alg list",
		french: "Liste des algos"
	};
	static embedDescription = {
		english: "Here are the recognized algs :",
		french: "Voici les algos reconnus :"
	};
	static algSets = [
		{
			emoji: "<:3x3solved:708049634349547531>",
			name: {
				english: "PLL",
				french: "PLL"
			},
			algs: ["PLL_Aa", "PLL_Ab", "PLL_E", "PLL_F", "PLL_Ga", "PLL_Gb", "PLL_Gc", "PLL_Gd", "PLL_H", "PLL_Ja", "PLL_Jb",
				"PLL_Na", "PLL_Nb", "PLL_Ra", "PLL_Rb", "PLL_T", "PLL_Ua", "PLL_Ub", "PLL_V", "PLL_Y", "PLL_Z"]
		},
		{
			emoji: "<:oll:1150469620055163061>",
			name: {
				english: "OLL",
				french: "OLL"
			},
			algs: [
				"OLL_1", "OLL_2", "OLL_3", "OLL_4", "OLL_5", "OLL_6", "OLL_7", "OLL_8", "OLL_9", "OLL_10",
				"OLL_11", "OLL_22", "OLL_13", "OLL_14", "OLL_15", "OLL_16", "OLL_17", "OLL_18", "OLL_19", "OLL_20",
				"OLL_21", "OLL_32", "OLL_23", "OLL_24", "OLL_25", "OLL_26", "OLL_27", "OLL_28", "OLL_29", "OLL_30",
				"OLL_31", "OLL_32", "OLL_33", "OLL_34", "OLL_35", "OLL_36", "OLL_37", "OLL_38", "OLL_39", "OLL_40",
				"OLL_41", "OLL_42", "OLL_43", "OLL_44", "OLL_45", "OLL_46", "OLL_47", "OLL_48", "OLL_49", "OLL_50",
				"OLL_51", "OLL_52", "OLL_53", "OLL_54", "OLL_55", "OLL_56", "OLL_57"
			],
			option: "oll"
		},
		{
			emoji: "<:cmll:1150469625075736706>",
			name: {
				english: "CMLL",
				french: "CMLL"
			},
			algs: [
				"CMLL_Unoswap", "CMLL_Udiag", "CMLL_Ufront", "CMLL_Uright", "CMLL_Uback", "CMLL_Uleft",
				"CMLL_Tnoswap", "CMLL_Tdiag", "CMLL_Tfront", "CMLL_Tright", "CMLL_Tback", "CMLL_Tleft",
				"CMLL_Lnoswap", "CMLL_Ldiag", "CMLL_Lfront", "CMLL_Lright", "CMLL_Lback", "CMLL_Lleft",
				"CMLL_Snoswap", "CMLL_Sdiag", "CMLL_Sfront", "CMLL_Sright", "CMLL_Sback", "CMLL_Sleft",
				"CMLL_Asnoswap", "CMLL_Asdiag", "CMLL_Asfront", "CMLL_Asright", "CMLL_Asback", "CMLL_Asleft",
				"CMLL_Hnoswap", "CMLL_Hdiag", "CMLL_Hfront", "CMLL_Hright",
				"CMLL_Pinoswap", "CMLL_Pidiag", "CMLL_Pifront", "CMLL_Piright", "CMLL_Piback", "CMLL_Pileft"
			],
			option: "cmll"
		},
		{
			emoji: "<:sune:1150474120769847436>",
			name: {
				english: "Sunes, antisunes, niklas",
				french: "Sunes, antisunes, niklas"
			},
			algs: ["sune", "doubleleftsune", "triplebackantisune", "niklasright"],
		},
		{
			emoji: "<:sledge:1150474687147675689>",
			name: {
				english: "Usual triggers",
				french: "Triggers usuels"
			},
			algs: ["sexy", "sledge", "antisexy", "hedge", "backdoublesexy", "triplesledge"]
		},
		{
			emoji: "<:4x4x4parityOLL:1150469622450098317>",
			name: {
				english: "4x4 parities",
				french: "Parités du 4x4"
			},
			algs: ["4x4ollparity", "4x4pllparity", "4x4pllparitybigcubes"],
			option: "4"
		},
		{
			emoji: "<:3BLD:1125683042539802745>",
			name: {
				english: "Commutators, conjugates and multiples",
				french: "Commutateurs, conjugués et multiples"
			},
			algs: ["[F : R U R' U']", "[R' D' R, U]", "(R2' F2 R2 U')2"]
		}
	];
	static buildEmbed = (embedColor, language, prefix, highlightLanguage) => {
		return DiscordMessageEmbedBuilder.createEmbed(
			embedColor,
			AlgListHelpEmbedBuilder.embedTitle[language],
			DiscordMessageEmbedBuilder.noTitleUrl,
			AlgListHelpEmbedBuilder.embedDescription[language],
			AlgListHelpEmbedBuilder.algSets.map(algSet => {return {
				name: `${algSet.emoji} ${algSet.name[language]}`,
				value: `${algSet.algs.map(alg => `\`${alg}\``).join(", ")}.\`\`\`${highlightLanguage}\n${prefix}alg ${algSet.algs[0]}${algSet.option ? ` -${algSet.option}` : ""}\`\`\``
			}}),
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
	};
};

class OptionsHelpEmbedBuilder {
	static embedTitle = {
		english: "Options",
		french: "Options"
	};
	static headerLabel = {
		english: "Here are the options I support",
		french: "Voici les options que je supporte"
	};
	static optionsFields = [
		{
			name: "puzzle",
			value: {
				english: "Specifies a puzzle on which to show the alg. Valid puzzles : all cubes from 1 to 34 (limited to 10 for VisualCube).",
				french: "Spécifie le puzzle sur lequel montrer l'algo. Puzzles valides : tous les cubes de 1 à 34 (limité à 10 pour VisualCube)."
			},
			example: "4x4ollparity -4"
		},
		{
			name: "stage",
			value: {
				english: "Hides some stickers of the puzzle to show a precise step (not yet supported by Holo-Cube). Valid options : "
				+ `${OptionsHandler.planViewStages.map(option => `\`-${option}\``).join(", ")} (apply a "plan" view"), `
				+ `${OptionsHandler.isometricViewStages.map(option => `\`-${option}\``).join(", ")} (apply an "isometric" view").`,
				french: "Masque des stickers sur le puzzle pour montrer une étape précise (pas encore supporté par Holo-Cube). Options valides : "
				+ `${OptionsHandler.planViewStages.map(option => `\`-${option}\``).join(", ")} (appliquent une vue "plan"), `
				+ `${OptionsHandler.isometricViewStages.map(option => `\`-${option}\``).join(", ")} (appliquent une vue "isometric").`
			},
			example: "sexy sledge -cll"
		},
		{
			name: "view",
			value: {
				english: "Force the view : `plan` or `isometric` (`normal` view is obsolete).",
				french: "Force la vue : `plan` ou `isometric` (la vue `normal` est obsolète)."
			},
			example: "sexy sledge -cmll -isometric"
		},
		{
			name: "color",
			value: {
				english: `Specifies the color of the top face (${Object.keys(OptionsHandler.colorSchemes).filter(option => option.includes("-")).map(option => `\`-${option}\``).join(", ")})`
					+ `and even the color of the front face (${Object.keys(OptionsHandler.colorSchemes).filter(option => !option.includes("-")).map(option => `\`-${option}\``).join(", ")}).`,
				french: `Spécifie la couleur de la face du haut (${Object.keys(OptionsHandler.colorSchemes).filter(option => option.includes("-")).map(option => `\`-${option}\``).join(", ")})`
					+ `voire la couleur de la face avant (${Object.keys(OptionsHandler.colorSchemes).filter(option => !option.includes("-")).map(option => `\`-${option}\``).join(", ")}).`
			},
			example: "M' U M U' -isometric -yellow-orange"
		},
		{
			name: "count",
			value: {
				english: `Count the moves with the given metrics : ${OptionsHandler.metrics.map(metric => `\`-${metric}\``).join(", ")}. \`-count\` counts with all metrics.`,
				french: `Compte les mouvements avec les métriques données : ${OptionsHandler.metrics.map(metric => `\`-${metric}\``).join(", ")}. \`-count\` compte avec toutes les métriques.`,
			},
			example: "PLL_Y -count"
		},
		{
			name: "merge",
			value: {
				english: "Merges and cancels moves if possible.",
				french: "Fusionne et annule les mouvements si possible."
			},
			example: "OLL_33 OLL_37 -merge"
		},
		{
			name: "rotatable",
			value: {
				english: "Allows to rotate the cube to see different angles.",
				french: "Permet de faire tourner le cube pour voir différents angles."
			},
			example: "f R' f' -rotatable"
		}
	];
	static buildEmbed = (embedColor, language, prefix, highlightLanguage) => {
		return DiscordMessageEmbedBuilder.createEmbed(
			embedColor,
			OptionsHelpEmbedBuilder.embedTitle[language],
			DiscordMessageEmbedBuilder.noTitleUrl,
			OptionsHelpEmbedBuilder.headerLabel[language],
			OptionsHelpEmbedBuilder.optionsFields.map(field => {return {
				name: `\`-${field.name}\``,
				value: `${field.value[language]}\`\`\`${highlightLanguage}\n${prefix}alg ${field.example}\`\`\``
			}}),
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
	};
};

class InteractionHelpEmbedBuilder {
	static embedTitle = {
		english: "Interactions",
		french: "Interactions"
	};
	static prefixFieldName = {
		english: ":arrow_forward: Prefix",
		french: ":arrow_forward: Préfixe"
	};
	static prefixFieldValue = {
		english: "I answer any message starting with ",
		french: "Je réponds à tout message commençant par "
	};
	static otherFields = [
		{
			name: {
				english: ":pencil2: Edition and deletion",
				french: ":pencil2: Modification et suppression"
			},
			value: {
				english: "When a command is edited/deleted, I will update/delete my answer. Few bots do this !",
				french: "Quand une commande est modifiée/supprimée, je modifie/supprime ma réponse. Rares sont les bots qui font cela !"
			}
		},
		{
			name: {
				english: ":broom: Incorrect command",
				french: ":broom: Commande incorrecte"
			},
			value: {
				english: "If a command is incorrect, it will be deleted after 30 seconds for channel cleaning, except if it was edited in between.",
				french: "Si une commande est incorrecte, elle sera supprimée au bout de 30 secondes, excepté si elle a été modifiée entre temps."
			}
		},
		{
			name: {
				english: ":magic_wand: Support",
				french: ":magic_wand: Support"
			},
			value: {
				english:
				"\nIn addition to message commands, I also support :"
				+ "\n- [Slash Commands](https://discord.com/blog/slash-commands-are-here) (click the message textbox > type `/` > choose a command)"
				+ "\n- User context menu commands (right click any user > Applications > choose a command)"
				+ "\n- Message context menu commands (right click any message > Applications > choose a command)",
				french:
					"\nEn plus des commandes par message, je supporte également :"
					+ "\n- Les [Commandes Slash](https://discord-france.fr/commandes-slash) (cliquer dans la zone d'écriture de message > taper `/` > choisir une commande)"
					+ "\n- Les commandes du menu contextuel des utilisateurs (clic droit sur un utilisateur > Applications > choisir une commande)"
					+ "\n- Les commandes du menu contextuel des messages (clic droit sur un message > Applications > choisir une commande)"
			}
		}
	];
	static buildEmbed = (embedColor, language, prefix) => {
		return DiscordMessageEmbedBuilder.createEmbed(
			embedColor,
			InteractionHelpEmbedBuilder.embedTitle[language],
			DiscordMessageEmbedBuilder.noTitleUrl,
			DiscordMessageEmbedBuilder.noDescription,
			[
				{
					name: InteractionHelpEmbedBuilder.prefixFieldName[language],
					value: `${InteractionHelpEmbedBuilder.prefixFieldValue[language]}${prefix}.`
				},
				...InteractionHelpEmbedBuilder.otherFields.map(field => {return {
					name: field.name[language],
					value: field.value[language]
				}})
			],
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
	};
};

export {HelpCommandHandler};
