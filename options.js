"use strict";

const parseOptions = options => {
	let result = {stage: "pll", view: undefined, puzzle: "3", colorScheme: "wrgyob", unrecognizedOptions: []}; // default parameters
	for (let option of options) {
		option = option.toLowerCase();
		if (option === "-yellow") {
			result.colorScheme = "yogwrb";
		} else if (isPuzzleOption(option)) {
			result.puzzle = getPuzzleFromOption(option);
		} else if (isViewOption(option)) {
			result.view = option.slice(1);
		} else if (isStageOption(option)) {
			result.stage = getStageFromOption(option);
			if (result.view === undefined) {
				result.view = getViewFromStageOption(option);
			}
		} else {
			result.unrecognizedOptions.push(option);
		}
	}
	if (result.view === undefined) {
		result.view = "plan";
	}
	return result;
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
	return /^-(ollcp|(o|oc|oe|co|coe|cm|zb|1l)?ll|wv)$/i.test(option);
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

// option help message

const getOptionsHelpMessage = () => {
	return "Voici les options que je prends en charge :\n"
		+ "\n`-puzzle` permet d'afficher l'algo sur un puzzle autre que 3x3 :"
		+ "```yaml\n$alg Lw' U2 Lw' U2 F2 Lw' F2 Rw U2 Rw' U2' Lw2' -5```"
		+ "Puzzles valides : tous les cubes de 1 à 10.\n"
		+ "\n`-stage` masque certains stickers du cube pour faire apparaître une étape précise :"
		+ "```yaml\n$alg R' F R U R' U' F' U R -oll```"
		+ "Stages valides :\n"
		+ "`cll`, `cmll`, `coll`, `ell`, `ll`, `ocll`, `ocell`, `oell`, `oll`, `ollcp`, `wv`, `zbll`, `1LLL` (appliquent une vue \"plan\")\n"
		+ "`cls`, `cross`, `els`, `fl`, `f2b`, `f2l`, `f2l_1`, `f2l_2`, `f2l_sm`, `f2l_3`, `line`, `vh`, `zbls`, `2x2x2`, `2x2x3` (appliquent une vue \"normal\")\n"
		+ "\n`-view` permet de modifier la vue :"
		+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -normal```"
		+ "Vues valides : plan, normal, trans.\n"
		+ "\n`-yellow` affiche le cube avec du jaune en haut à la place du blanc par défaut :"
		+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```";
};

module.exports = {getOptionsHelpMessage, parseOptions};
