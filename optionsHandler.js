"use strict";

class OptionsHandler {
	static planViewStages = [
		"pll", "zbll", "ell", "1lll", "lse", "lsep", "l4c", "zzll",
		"ollcp", "coll", "cpeoll",
		"oll", "ocll",
		"eoll",
		"llef",
		"cll",
		"cmll"
	];
	static isometricViewStages = [
		"vls", "hls", "ols", "wv", "sv", "mw", "cls", "jtle",
		"zbls", "eols", "vhls", "els",
		"eolr",
		"f2l",
		"cross",
		"fb",
		"sb",
		"fl",
		"cols",
		"l2c",
		"l2e"
	];
	//static isometricViewStages = [
	//  "f2l_1", "f2l_2", "f2l_3", "f2l_sm",
	// 	"line", "2x2x2", "2x2x3"
	//];
	static planView = "plan";
	static isometricView = "isometric";
	static topDownView = "topDown";
	static netView = "net";
	static views = [
		OptionsHandler.planView,
		OptionsHandler.isometricView
		//OptionsHandler.topDownView, // todo activate when available
		//OptionsHandler.netView // todo activate when available
	];
	static htmMetric = "htm";
	static stmMetric = "stm";
	static etmMetric = "etm";
	static qtmMetric = "qtm";
	static metrics = [
		OptionsHandler.htmMetric,
		OptionsHandler.stmMetric,
		OptionsHandler.etmMetric,
		OptionsHandler.qtmMetric
	];
	static colorSchemes = {
		"white": {U: "white", F: "green", R: "red", D: "yellow", B: "blue", L: "orange"},
		"yellow": {U: "yellow", F: "green", R: "orange", D: "white", B: "blue", L: "red"},
		"green": {U: "green", F: "yellow", R: "red", D: "blue", B: "white", L: "orange"},
		"blue": {U: "blue", F: "white", R: "red", D: "green", B: "yellow", L: "orange"},
		"red": {U: "red", F: "green", R: "yellow", D: "orange", B: "blue", L: "white"},
		"orange": {U: "orange", F: "green", R: "white", D: "red", B: "blue", L: "yellow"},
		"white-green": {U: "white", F: "green", R: "red", D: "yellow", B: "blue", L: "orange"},
		"white-red": {U: "white", F: "red", R: "blue", D: "yellow", B: "orange", L: "green"},
		"white-blue": {U: "white", F: "blue", R: "orange", D: "yellow", B: "green", L: "red"},
		"white-orange": {U: "white", F: "orange", R: "green", D: "yellow", B: "red", L: "blue"},
		"red-white": {U: "red", F: "white", R: "green", D: "orange", B: "yellow", L: "blue"},
		"red-green": {U: "red", F: "green", R: "yellow", D: "orange", B: "blue", L: "white"},
		"red-yellow": {U: "red", F: "yellow", R: "blue", D: "orange", B: "white", L: "green"},
		"red-blue": {U: "red", F: "blue", R: "white", D: "orange", B: "green", L: "yellow"},
		"green-white": {U: "green", F: "white", R: "orange", D: "blue", B: "yellow", L: "red"},
		"green-red": {U: "green", F: "red", R: "white", D: "blue", B: "orange", L: "yellow"},
		"green-yellow": {U: "green", F: "yellow", R: "red", D: "blue", B: "white", L: "orange"},
		"green-orange": {U: "green", F: "orange", R: "yellow", D: "blue", B: "red", L: "white"},
		"yellow-green": {U: "yellow", F: "green", R: "orange", D: "white", B: "blue", L: "red"},
		"yellow-red": {U: "yellow", F: "red", R: "green", D: "white", B: "orange", L: "blue"},
		"yellow-blue": {U: "yellow", F: "blue", R: "red", D: "white", B: "green", L: "orange"},
		"yellow-orange": {U: "yellow", F: "orange", R: "blue", D: "white", B: "red", L: "green"},
		"orange-white": {U: "orange", F: "white", R: "blue", D: "red", B: "yellow", L: "green"},
		"orange-green": {U: "orange", F: "green", R: "white", D: "red", B: "blue", L: "yellow"},
		"orange-yellow": {U: "orange", F: "yellow", R: "green", D: "red", B: "white", L: "blue"},
		"orange-blue": {U: "orange", F: "blue", R: "yellow", D: "red", B: "green", L: "white"},
		"blue-white": {U: "blue", F: "white", R: "red", D: "green", B: "yellow", L: "orange"},
		"blue-red": {U: "blue", F: "red", R: "yellow", D: "green", B: "orange", L: "white"},
		"blue-yellow": {U: "blue", F: "yellow", R: "orange", D: "green", B: "white", L: "red"},
		"blue-orange": {U: "blue", F: "orange", R: "white", D: "green", B: "red", L: "yellow"}
	};
	static standardParsingMode = "standardParsing";
	static bigBlindParsingMode = "bigbld";
	static teamBlindParsingMode = "teambld";
	static parsingModes = [
		OptionsHandler.standardParsingMode,
		OptionsHandler.bigBlindParsingMode,
		OptionsHandler.teamBlindParsingMode
	];
	static defaultOptions = {
		holoCube: false,
		puzzle: "cube3x3x3",
		stage: "pll",
		view: OptionsHandler.planView,
		countMoves: {
			htm: false,
			stm: false,
			etm: false,
			qtm: false
		},
		mergeMoves: false,
		colorScheme: {
			U: "white",
			F: "green",
			R: "red",
			D: "yellow",
			B: "blue",
			L: "orange"
		},
		parsingMode: OptionsHandler.standardParsingMode,
		rotatable: false,
		errors: []
	};
	static unrecognizedOptionErrorMessage = {
		english: "Unrecognized option",
		french: "Option non reconnue"
	};
	static wrongOptionStartErrorMessage = {
		english: "Option doesn't start with an hyphen (-)",
		french: "Option ne commençant pas par un tiret (t)"
	};
	static emptyOptionErrorMessage = {
		english: "Empty option",
		french: "Option vide"
	};
	static invalidPuzzleSizeErrorMessage = {
		english: "Puzzle size is too big (max = 34)",
		french: "La taille du puzzle est trop grande (max = 34)"
	};
	constructor(algCommandHandler) {
		this.algCommandHandler = algCommandHandler;
		let language = this.algCommandHandler.commandHandler.messageHandler.algBot.language;
		this.unrecognizedOptionErrorMessage = OptionsHandler.unrecognizedOptionErrorMessage[language];
		this.wrongOptionStartErrorMessage = OptionsHandler.wrongOptionStartErrorMessage[language];
		this.emptyOptionErrorMessage = OptionsHandler.emptyOptionErrorMessage[language];
		this.invalidPuzzleSizeErrorMessage = OptionsHandler.invalidPuzzleSizeErrorMessage[language];
	};
	parseOptions = options => {
		let optionsResult = structuredClone(OptionsHandler.defaultOptions);
		let forcedView = null;
		for (let rawOption of options.split(" ").filter(option => option.length !== 0)) {
			if (!rawOption.startsWith("-")) {
				optionsResult.errors.push({
					option: rawOption,
					message: this.wrongOptionStartErrorMessage
				});
				continue;
			};
			let option = rawOption.substring(1).toLowerCase();
			if (option.length === 0) {
				optionsResult.errors.push({
					option: option,
					message: this.emptyOptionErrorMessage
				});
			} else if (/^\d+$/.test(option)) { // only regular cubes are supported
				if (parseInt(option) <= 34) {
					optionsResult.puzzle = `cube${option}x${option}x${option}`;
				} else {
					optionsResult.errors.push({
						option: option,
						message: this.invalidPuzzleSizeErrorMessage
					});
				}
			} else if (OptionsHandler.planViewStages.includes(option)) {
				optionsResult.stage = option;
				optionsResult.view = OptionsHandler.planView;
			} else if (OptionsHandler.isometricViewStages.includes(option)) {
				optionsResult.stage = option;
				optionsResult.view = OptionsHandler.isometricView;
			} else if (OptionsHandler.views.includes(option)) {
				forcedView = option;
			} else if (OptionsHandler.metrics.includes(option)) {
				optionsResult.countMoves[option] = true;
			} else if (option === "count") { // shortcut for all metrics
				OptionsHandler.metrics.forEach(metric => optionsResult.countMoves[metric] = true);
			} else if (option === "merge") {
				optionsResult.mergeMoves = true;
			} else if (OptionsHandler.colorSchemes[option]) {
				optionsResult.colorScheme = OptionsHandler.colorSchemes[option];
			} else if (OptionsHandler.parsingModes.includes(option)) {
				optionsResult.parsingMode = option;
			} else if (option === "rotatable") {
				optionsResult.rotatable = true;
			} else {
				optionsResult.errors.push({
					option: option,
					message: this.unrecognizedOptionErrorMessage
				})
			}
		}
		if (forcedView) {
			optionsResult.view = forcedView;
		}
		return optionsResult;
	};
};

export {OptionsHandler};
