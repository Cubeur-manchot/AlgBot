"use strict";

const parseOptions = optionsList => {
	let optionObject = {
		stage: "pll",
		view: undefined,
		puzzle: "3",
		colorScheme: "wrgyob",
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
		if (option === "-yellow") {
			optionObject.colorScheme = "yogwrb";
		} else if (isPuzzleOption(option)) {
			optionObject.puzzle = getPuzzleFromOption(option);
		} else if (isViewOption(option)) {
			optionObject.view = option.slice(1);
		} else if (isStageOption(option)) {
			optionObject.stage = getStageFromOption(option);
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
	return isStageOptionWithPlanView(option) || /^-(cross|fl|f2l(_1|_2|_3|_sm)?|(e|c|zb)ls|line|2x2x2|2x2x3|f2b|vh|vls)$/i.test(option);
};

const isStageOptionWithPlanView = option => {
	return /^-(ollcp|(o|oc|oe|c|co|cm|e|oce|p|zb|1l)?ll|wv)$/i.test(option);
};

const getStageFromOption = option => {
	switch(option) {
		case "-zbll": case "-1lll": return "pll";
		case "-ollcp": return "coll";
		case "-zbls": return "vh";
		case "-vls": return "wv";
		default: return option.slice(1); // just remove "-" at the beginning
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
	return /-(count|[hse]tm)/.test(option);
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
			+ "`cls`, `cross`, `els`, `fl`, `f2b`, `f2l`, `f2l_1`, `f2l_2`, `f2l_sm`, `f2l_3`, `line`, `vh`, `vls`, `zbls`, `2x2x2`, `2x2x3` (appliquent une vue \"normal\")\n"
			+ "\n`-view` : permet de modifier la vue :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -normal```"
			+ "Vues valides : plan, normal, trans.\n"
			+ "\n`-yellow` : affiche le cube avec du jaune en haut à la place du blanc par défaut :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm` : compte les mouvements avec la métrique demandée (`-count` : compte avec toutes les métriques) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : fusionne et annule les mouvements si possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```\n";
	} else { // english
		return "Here are the options I support :\n"
			+ "\n`-puzzle` : allows to display the alg on a puzzle other than 3x3 :"
			+ "```yaml\n$alg Lw' U2 Lw' U2 F2 Lw' F2 Rw U2 Rw' U2' Lw2' -5```"
			+ "Valid puzzles : all cubes from 1 to 10.\n"
			+ "\n`-stage` : hides some stickers of the cube to show a precise step :"
			+ "```yaml\n$alg R' F R U R' U' F' U R -oll```"
			+ "Valid stages :\n"
			+ "`cll`, `cmll`, `coll`, `ell`, `ll`, `ocll`, `ocell`, `oell`, `oll`, `ollcp`, `pll`, `wv`, `zbll`, `1lll` (apply a \"plan\" view)\n"
			+ "`cls`, `cross`, `els`, `fl`, `f2b`, `f2l`, `f2l_1`, `f2l_2`, `f2l_sm`, `f2l_3`, `line`, `vh`, `vls`, `zbls`, `2x2x2`, `2x2x3` (apply a \"normal\" view)\n"
			+ "\n`-view` : allows to change the view :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -normal```"
			+ "Valid views : plan, normal, trans.\n"
			+ "\n`-yellow` : displays the cube with yellow on top instead of white by default :"
			+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
			+ "\n`-htm`, `-stm`, `-etm` : count moves with specified metrics (`-count` : count with all metrics) :"
			+ "```yaml\n$alg PLL_Y -count```"
			+ "\n`-merge` : merge and cancel moves if possible"
			+ "```yaml\n$alg OLL_33 OLL_37 -merge```\n";
	}
};

module.exports = {getOptionsHelpMessage, getUnrecognizedOptionsErrorMessage, getUnsupportedPuzzleErrorMessage, parseOptions};
