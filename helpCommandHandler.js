"use strict";

import {DiscordMessageComponentBuilder} from "./discordUtils/discordMessageComponentBuilder.js";
import {DiscordMessageEmbedBuilder} from "./discordUtils/discordMessageEmbedBuilder.js";

class HelpCommandHandler {
	static generalHelpEmbedTitle = {
		english: "Help",
		french: "Aide"
	};
	static generalHelpHeaderLabel = {
		english: "I'm a :robot: that displays images of",
		french: "Je suis un :robot: qui affiche des images de"
	};
	static generalHelpCommands = [{
		name: "alg",
		description: {
			english: "Displays the case that the alg solves",
			french: "Affiche le cas que l'algo résout"
		},
		argumentsExample: "r U R' F' R U R' U' R' F R2 U' r'"
	}, {
		name: "do",
		description: {
			english: "Applies the alg on a solved cube and displays the result",
			french: "Applique l'algo sur un cube résolu et affiche le résultat"
		},
		argumentsExample: "r U R' F' R U R' U' R' F R2 U' r'"
	}, {
		name: "help",
		description: {
			english: "Displays this help, the recognized algs and the supported options",
			french: "Affiche cette aide, les algos reconnus et les options supportées"
		}
	}, {
		name: "invite",
		description: {
			english: "Displays the links to invite me to a server",
			french: "Affiche les liens pour m'inviter sur un serveur"
		}
	}, {
		name: "feedback",
		description: {
			english: "Allows to give feedback, for example to report a bug",
			french: "Permet de donner un feedback, par exemple pour rapporter un bug"
		}
	}, {
		name: "servers",
		description: {
			english: "Lists all servers I am on",
			french: "Liste tous les serveurs sur lesquels je suis"
		}
	}];
	static generalHelpFooterLabel = {
		english:
			"\nIf the command is edited/deleted, I'll automatically adapt my answer.\n"
			+ "\nIf a command is incorrect, I'll send an error message,"
			+ " and I'll delete the command after 10 seconds to clean the channel.",
		french:
			"\nSi la commande est modifiée ou supprimée, j'adapte automatiquement ma réponse.\n"
			+ "\nSi une commande est incorrecte, j'envoie un message d'erreur,"
			+ " et je supprime la commande au bout de 10 secondes pour faire le ménage."
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
			+ "```parser3\n$alg 4x4ollparity 4x4pllparity 4x4pllparitybigcubes -4```"
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
			+ "```parser3\n$alg 4x4ollparity 4x4pllparity 4x4pllparitybigcubes -4```"
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
			+ "Valid views : plan, isometric.\n"
			+ "\n`-yellow`, `-yellow-orange` : displays the cube with first color on top and second color on front (default : white on top, green on front) :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm`, `-qtm` : count moves with specified metrics (`-count` : count with all metrics) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : merge and cancel moves if possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```"
			+ "\n`-rotatable` : enables to rotate the cube by clicking on the reactions (temporarily disabled)"
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
			+ "Vues valides : plan, isometric.\n"
			+ "\n`-yellow`, `-yellow-orange` : affiche le cube avec la première couleur en haut et la deuxième couleur devant (par défaut : blanc en haut, vert devant) :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm`, `-qtm` : compte les mouvements avec la métrique demandée (`-count` : compte avec toutes les métriques) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : fusionne et annule les mouvements si possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```"
			+ "\n`-rotatable` : permet de faire tourner le cube en cliquant sur les réactions (temporairement désactivé)"
			+ "```yaml\n$alg sune -rotatable```"
	};
	static generalHelpSelectOptionLabel = {
		english: "General help",
		french: "Aide générale"
	};
	static algListHelpSelectOptionLabel = {
		english: "Alg list",
		french: "Liste des algos"
	};
	static optionsHelpSelectOptionLabel = {
		english: "Options",
		french: "Options"
	};
	static helpSelectOptionCustomId = "helpSelectOption";
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		let language = this.commandHandler.messageHandler.algBot.language;
		let prefix = this.commandHandler.messageHandler.algBot.prefix;
		this.helpSelectOptionCustomId = this.commandHandler.buildCustomId(HelpCommandHandler.helpSelectOptionCustomId);
		let generalHelpEmbedMessage =
			`${HelpCommandHandler.generalHelpHeaderLabel[language]} <:3x3solved:708049634349547531>\n`
			+ HelpCommandHandler.generalHelpCommands
				.map(command =>
					`\n\`${prefix}${command.name}\` : ${command.description[language]}`
					+ "```parser3\n"
					+ `${prefix}${command.name}`
					+ (command.argumentsExample ? ` ${command.argumentsExample}` : "")
					+ "```")
				.join("")
			+ HelpCommandHandler.generalHelpFooterLabel[language];
		this.generalHelpEmbed = DiscordMessageEmbedBuilder.createEmbed(
			embedColor,
			HelpCommandHandler.generalHelpEmbedTitle[language],
			DiscordMessageEmbedBuilder.noTitleUrl,
			generalHelpEmbedMessage,
			DiscordMessageEmbedBuilder.noFields,
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
		this.algListHelpEmbed = DiscordMessageEmbedBuilder.createEmbed(
			embedColor,
			HelpCommandHandler.algListHelpEmbedTitle[language],
			DiscordMessageEmbedBuilder.noTitleUrl,
			HelpCommandHandler.algListHelpEmbedMessage[language],
			DiscordMessageEmbedBuilder.noFields,
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
		this.optionsHelpEmbed = DiscordMessageEmbedBuilder.createEmbed(
			embedColor,
			HelpCommandHandler.optionsHelpEmbedTitle[language],
			DiscordMessageEmbedBuilder.noTitleUrl,
			HelpCommandHandler.optionsHelpEmbedMessage[language],
			DiscordMessageEmbedBuilder.noFields,
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
		this.selectOptions = [
			{label: HelpCommandHandler.generalHelpSelectOptionLabel[language], emoji: "💡", value: "general"},
			{label: HelpCommandHandler.algListHelpSelectOptionLabel[language], emoji: "📖", value: "algList"},
			{label: HelpCommandHandler.optionsHelpSelectOptionLabel[language], emoji: "🔧", value: "options"}
		];
	};
	getHelpCommandResult = () => {
		return {
			message: {
				textContent: "",
				embed: this.generalHelpEmbed,
				components: DiscordMessageComponentBuilder.createRowWithSelectComponents(
					this.selectOptions, this.selectOptions[0].value, this.helpSelectOptionCustomId)
			},
			error: false
		};
	};
	handleHelpStringSelectInteraction = interaction => {
		let interactionValue = interaction.values[0];
		interaction.update({
			embeds: [this[`${interactionValue}HelpEmbed`]],
			components: DiscordMessageComponentBuilder.createRowWithSelectComponents(
				this.selectOptions, interactionValue, this.helpSelectOptionCustomId)
		})
		.catch(interactionCreateError => this.algBot.logger.errorLog(
			`Fail to create interaction on StringSelect component for AlgBot (${this.algBot.language}) : "${interactionCreateError}".`
		))
	};
};

export {HelpCommandHandler};
