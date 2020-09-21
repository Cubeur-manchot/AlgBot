"use strict";

const {getGeneralHelpMessage} = require("./help.js");
const {getOptionsHelpMessage, getUnrecognizedOptionsErrorMessage, getUnsupportedPuzzleErrorMessage, parseOptions} = require("./options.js");
const {getAlgListHelpMessage, parseMoves, countMoves} = require("./algs.js");

const getInfoFromCommand = (message, language) => {
	let answer = {answerContent: "", answerOptions: {}, errorInCommand: false, addReactions: false};
	if (message.content.startsWith("$alg ") || message.content.startsWith("$do ")) {
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
	} else if (message.content === "$help") {
		answer.answerContent = getGeneralHelpMessage(language);
	} else if (message.content === "$options") {
		answer.answerContent = getOptionsHelpMessage(language);
	} else if (message.content === "$alglist") {
		answer.answerContent = getAlgListHelpMessage(language);
	} else {
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
	let {moveSequenceForAnswer, moveSequenceForVisualCube} = parseMoves(messageWords.filter(word => !word.startsWith("-"))); // parse moves
	let {stage, view, colorScheme, puzzle, shouldCountMoves, unrecognizedOptions} = parseOptions(messageWords.filter(word => word.startsWith("-"))); // parse options
	if (shouldCountMoves) {
		let {htmCount, stmCount, etmCount} = countMoves(moveSequenceForAnswer);
		moveSequenceForAnswer += ` (${htmCount} HTM, ${stmCount} STM, ${etmCount} ETM)`; // add move count if necessary
	}
	view = view === "normal" ? "" : `&view=${view}`; // adjust view for url
	if (/^([1-9]|10)$/.test(puzzle)) { // cubes (1-10)
		return {
			messageContent: moveSequenceForAnswer + (comments ? " //" + comments : ""),
			imageUrl: "http://roudai.net/visualcube/visualcube.php?fmt=png&bg=t&size=150"
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