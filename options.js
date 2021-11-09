"use strict";

const parseOptions = optionsList => {
	let optionObject = {
		stage: "pll",
		view: undefined,
		puzzle: "3",
		colorScheme: "wrgyob",
		rotatable: false,
		shouldCountMoves: {
			htm: false,
			stm: false,
			etm: false,
			qtm: false
		},
		shouldMergeMoves: false,
		unrecognizedOptions: []
	}; // default parameters
	for (let option of optionsList) {
		option = option.toLowerCase();
		if (isColorSchemeOption(option)) {
			optionObject.colorScheme = colorSchemeFromColors[option.substring(1)];
		} else if (isPuzzleOption(option)) {
			optionObject.puzzle = getPuzzleFromOption(option);
		} else if (isViewOption(option)) {
			optionObject.view = option.slice(1);
		} else if (isStageOption(option)) {
			Object.assign(optionObject, getStageFromOption(option));
			if (optionObject.view === undefined) {
				optionObject.view = getViewFromStageOption(option);
			}
		} else if (isCountOption(option)) {
			if (option === "-count") {
				optionObject.shouldCountMoves = {
					htm: true,
					stm: true,
					etm: true,
					qtm: true
				};
			} else {
				optionObject.shouldCountMoves[option.substring(1)] = true;
			}
		} else if (option === "-merge") {
			optionObject.shouldMergeMoves = true;
		} else if (option === "-rotatable") {
			optionObject.rotatable = true;
		} else {
			optionObject.unrecognizedOptions.push(option);
		}
	}
	if (optionObject.view === undefined) {
		optionObject.view = "plan";
	}
	return optionObject;
};

const getUnrecognizedOptionsErrorMessage = (unrecognizedOptions, language) => {
	if (language === "french") {
		return ":x: Option(s) non reconnue(s) :\n" + unrecognizedOptions;
	} else { // english
		return ":x: Unrecognized option(s) :\n" + unrecognizedOptions;
	}
};

// orientation options

const isColorSchemeOption = option => {
	let colorList = ["white", "red", "green", "yellow", "orange", "blue"];
	return (new RegExp(`^-(${colorList.join("|")})$`, "i")).test(option) // check format for single color
		|| ((new RegExp(`^(-(${colorList.join("|")})){2}$`, "i")).test(option) // check format for two colors
			&& !/^-(white-yellow|yellow-white|red-orange|orange-red|green-blue|blue-green)$/i.test(option) // check opposite colors
			&& !/^-(white-white|yellow-yellow|red-red|orange-orange|green-green|blue-blue)$/i.test(option)); // check double color
};

const colorSchemeFromColors = {
	"white": "wrgyob",
	"yellow": "yogwrb",
	"green": "grybow",
	"blue": "brwgoy",
	"red": "rygowb",
	"orange": "owgryb",
	"white-red": "wbrygo",
	"white-green": "wrgyob",
	"white-orange": "wgoybr",
	"white-blue": "wobyrd",
	"red-white": "rgwoby",
	"red-green": "rygowb",
	"red-yellow": "rbyogw",
	"red-blue": "rwboyg",
	"green-white": "gowbry",
	"green-red": "gwrbyo",
	"green-yellow": "grybow",
	"green-orange": "gyobwr",
	"yellow-red": "ygrwbo",
	"yellow-green": "yogwrb",
	"yellow-orange": "ybowgr",
	"yellow-blue": "yrbwog",
	"orange-white": "obwrgy",
	"orange-green": "owgryb",
	"orange-yellow": "ogyrbw",
	"orange-blue": "oybrwg",
	"blue-white": "brwgoy",
	"blue-red": "byrgwo",
	"blue-yellow": "boygrw",
	"blue-orange": "bwogyr"
};

// view options

const isViewOption = option => {
	return /^-(plan|normal|trans)$/i.test(option);
};

const getViewFromStageOption = option => {
	if (isStageOptionWithPlanView(option)) {
		return "plan";
	} else {
		return "normal";
	}
};

// stage options

const isStageOption = option => {
	return isStageOptionWithPlanView(option) || /^-(cross|fl|f2l(_1|_2|_3|_sm)?|(c|co|e|v|zb)ls|line|2x2x2|2x2x3|f2b|vh)$/i.test(option);
};

const isStageOptionWithPlanView = option => {
	return /^-(ollcp|(o|oc|oe|c|co|cm|e|oce|p|zb|1l)?ll|wv)$/i.test(option);
};

const getStageFromOption = option => {
	switch(option) {
		case "-zbll": case "-1lll": return {stage: "pll"};
		case "-ollcp": return {stage: "coll"};
		case "-zbls": return {stage: "vh"};
		case "-vls": return {stage: "wv"};
		case "-cols": return {faceletDefinition: "unununununnnrrrrrrnnnffffffdddddddddnnnllllllnnnbbbbbb"}; // custom coloring
		default: return {stage: option.slice(1)}; // just remove "-" at the beginning
	}
};

// puzzle options

const isPuzzleOption = option => {
	return /^-(\d+|(mega|kilo|pyra)(minx)?|sq1|sk(ew|we)b)$/i.test(option);
};

const getPuzzleFromOption = option => {
	switch (true) {
		case (/^-\d+$/.test(option)): return option.slice(1); // digit : just remove "-" character
		case (/^-(mega|kilo|pyra)(minx)?$/i.test(option)): return option.substring(1, 5); // megaminx, kilominx, pyraminx : take first 4 letters
		case (/^-sk(ew|we)b$/i.test(option)): return "skewb"; // skewb
		case (/^-sq1$/i.test(option)): return "sq1"; // square one
		default: return "3"; // default should not be reached, but 3x3 by default
	}
};

const getUnsupportedPuzzleErrorMessage = (puzzle, language) => {
	if (language === "french") {
		return ":x: Puzzle non pris en charge : " + puzzle;
	} else { // english
		return ":x: Unsupported puzzle : " + puzzle;
	}
};

// move count option

const isCountOption = option => {
	return /-(count|[hseq]tm)/.test(option);
};

// option help message

const getOptionsHelpMessage = language => {
	if (language === "french") {
		return "Voici les options que je prends en charge :\n"
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
			+ "\n`-yellow` : affiche le cube avec du jaune en haut à la place du blanc par défaut :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm`, `-qtm` : compte les mouvements avec la métrique demandée (`-count` : compte avec toutes les métriques) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : fusionne et annule les mouvements si possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```"
			+ "\n`-rotatable` : permet de faire tourner le cube en cliquant sur les réactions"
			+ "```yaml\n$alg sune -rotatable```";
	} else { // english
		return "Here are the options I support :\n"
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
			+ "\n`-yellow` : displays the cube with yellow on top instead of white by default :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm`, `-qtm` : count moves with specified metrics (`-count` : count with all metrics) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : merge and cancel moves if possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```"
			+ "\n`-rotatable` : enables to rotate the cube by clicking on the reactions"
			+ "```yaml\n$alg sune -rotatable```";
	}
};

module.exports = {getOptionsHelpMessage, getUnrecognizedOptionsErrorMessage, getUnsupportedPuzzleErrorMessage, parseOptions};
