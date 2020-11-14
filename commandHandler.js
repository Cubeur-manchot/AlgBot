"use strict";

const {getGeneralHelpMessage} = require("./help.js");
const {getOptionsHelpMessage, getUnrecognizedOptionsErrorMessage, getUnsupportedPuzzleErrorMessage, parseOptions} = require("./options.js");
const {cleanSequence, parseMoves, countMoves} = require("./algs.js");
const {getAlgListHelpMessage} = require("./algCollection.js");
const {mergeMoves} = require("./merging.js");

const getInfoFromCommand = (message, language) => {
	let answer = {answerContent: "", answerOptions: {}, errorInCommand: false, addReactions: false};
	if (/^\$(alg|do)(	| |$)/.test(message.content)) { // $alg or $do command
		answer.addReactions = true;
		let {messageContent, imageUrl, unrecognizedOptions, unrecognizedPuzzle} = parseTheCommand(message.content);
		if (unrecognizedPuzzle) {
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

const splitCommand = commandString => {
	let commandObject = {};
	let indexOfSpace = commandString.indexOf(" ");
	commandObject.algOrDo = indexOfSpace === 4 ? "alg" : "do"; // get alg or do
	commandString = commandString.substring(indexOfSpace + 1); // remove first word
	let indexOfComments = commandString.indexOf("//");
	if (indexOfComments !== -1) {
		commandObject.comments = commandString.slice(indexOfComments + 2); // get comments
		commandString = commandString.substring(0, indexOfComments); // remove comments
	}
	let indexOfOptions = commandString.indexOf("-");
	if (indexOfOptions !== -1) {
		commandObject.options = commandString.slice(indexOfOptions).split(" ").filter(x => {return x !== ""}); // get options
		commandObject.moves = commandString.substring(0, indexOfOptions); // get moves
	}
	return commandObject;
};

const parseTheCommand = command => {
	command = command.replace(/’/g, "'"); // replace wrong apostrophe typography
	let parsedCommand = splitCommand(command);
	let {moveSequenceForAnswer, moveSequenceForVisualCube} = parseMoves(cleanSequence(parsedCommand.moves)); // parse moves
	let {stage, view, colorScheme, puzzle, shouldCountMoves, shouldMergeMoves, unrecognizedOptions} = parseOptions(parsedCommand.options); // parse options
	if (shouldMergeMoves) {
		moveSequenceForAnswer = mergeMoves(moveSequenceForAnswer, +puzzle);
	}
	if (shouldCountMoves["htm"] || shouldCountMoves["stm"] || shouldCountMoves["etm"]) {
		moveSequenceForAnswer += " (" + countMoves(moveSequenceForAnswer, shouldCountMoves).join(", ") + ")"; // add move count if necessary
	}
	view = view === "normal" ? "" : `&view=${view}`; // adjust view for url
	if (/^([1-9]|10)$/.test(puzzle)) { // cubes (1-10)
		return {
			messageContent: moveSequenceForAnswer + (parsedCommand.comments ? " //" + parsedCommand.comments : ""),
			imageUrl: "http://cube.rider.biz//visualcube.php?fmt=png&bg=t&size=150"
				+ `${view}&pzl=${puzzle}&sch=${colorScheme}&stage=${stage}`
				+ `&${parsedCommand.algOrDo === "alg" ? "case" : "alg"}=` // $alg/$do command in AlgBot is respectively case/alg in VisualCube
				+ `${moveSequenceForVisualCube.replace(/'/g, "%27").replace(/&/g, "")}`,
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
