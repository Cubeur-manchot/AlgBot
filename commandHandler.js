"use strict";

const {getGeneralHelpMessage} = require("./help.js");
const {getOptionsHelpMessage, getUnrecognizedOptionsErrorMessage, getUnsupportedPuzzleErrorMessage, parseOptions} = require("./options.js");
const {getAlgListHelpMessage, cleanSequence, parseMoves, countMoves} = require("./algs.js");
const {mergeMoves} = require("./merging.js")

const getInfoFromCommand = (message, language) => {
	let answer = {answerContent: "", answerOptions: {}, errorInCommand: false, addReactions: false};
	if (/^\$(alg|do)(	| |$)/.test(message.content)) { // $alg or $do command
		answer.addReactions = true;
		let {messageContent, imageUrl, unrecognizedOptions, unrecognizedPuzzle} = parseTheCommand(message.content);
		if (unrecognizedPuzzle.length) {
			answer.answerContent = getUnsupportedPuzzleErrorMessage(unrecognizedPuzzle, language);
			answer.errorInCommand = true;
		} else if (unrecognizedOptions.length) {
			answer.answerContent = getUnrecognizedOptionsErrorMessage(unrecognizedOptions.join("\n"), language);
			answer.errorInCommand = true;
		} else {
			answer.answerContent = messageContent;
			answer.answerOptions = {files: [{attachment: imageUrl, name: "cubeImage.png"}]};
		}
	} else if (message.content === "$help") { // $help command
		answer.answerContent = getGeneralHelpMessage(language);
	} else if (message.content === "$options") { // $options command
		answer.answerContent = getOptionsHelpMessage(language);
	} else if (message.content === "$alglist") { // $alglist command
		answer.answerContent = getAlgListHelpMessage(language);
	} else { // unrecognized command
		answer.answerContent = getUnrecognizedCommandErrorMessage(message.content.split(" ")[0], language);
		answer.errorInCommand = true;
	}
	answer.addReactions &= !answer.errorInCommand; // don't react if there is an error in the command
	return answer;
};

const parseTheCommand = command => {
	command = command.replace(/’/g, "'"); // replace wrong apostrophe typography
	let comments = command.split("//").slice(1).join("");
	command = command.split("//")[0]; // removes comments
	let messageWords = command.split(" ");
	let caseOrAlg = messageWords[0] === "$alg" ? "case" : "alg"; // $alg/$do command in AlgBot is respectively case/alg in VisualCube
	messageWords = messageWords.slice(1); // remove first word
	let movesToParse = messageWords.filter(word => !word.startsWith("-"));
	let optionsToParse = messageWords.filter(word => word.startsWith("-"));
	let {moveSequenceForAnswer, moveSequenceForVisualCube} = parseMoves(cleanSequence(movesToParse.join(" "))); // parse moves
	let {stage, view, colorScheme, puzzle, shouldCountMoves, shouldMergeMoves, unrecognizedOptions} = parseOptions(optionsToParse); // parse options
	if (shouldMergeMoves) {
		moveSequenceForAnswer = mergeMoves(moveSequenceForAnswer, +puzzle);
	}
	if (shouldCountMoves["htm"] || shouldCountMoves["stm"] || shouldCountMoves["etm"]) {
		moveSequenceForAnswer += " (" + countMoves(moveSequenceForAnswer, shouldCountMoves).join(", ") + ")"; // add move count if necessary
	}
	view = view === "normal" ? "" : `&view=${view}`; // adjust view for url
	if (/^([1-9]|10)$/.test(puzzle)) { // cubes (1-10)
		return {
			messageContent: moveSequenceForAnswer + (comments ? " //" + comments : ""),
			imageUrl: "http://cube.rider.biz//visualcube.php?fmt=png&bg=t&size=150"
				+ `${view}&pzl=${puzzle}&sch=${colorScheme}&stage=${stage}`
				+ `&${caseOrAlg}=${moveSequenceForVisualCube.replace(/'/g, "%27").replace(/&/g, "")}`,
			unrecognizedOptions: unrecognizedOptions,
			unrecognizedPuzzle: ""
		};
	} else { // puzzle not yet supported
		return {unrecognizedPuzzle: puzzle};
	}
};

const getUnrecognizedCommandErrorMessage = (command, language) => {
	if (language === "french") {
		return ":x: Commande non reconnue : " + command;
	} else {
		return ":x: Unrecognized command : " + command;
	}
};

module.exports = {getInfoFromCommand};
