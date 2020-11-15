"use strict";

const {getGeneralHelpMessage} = require("./help.js");
const {getOptionsHelpMessage, getUnrecognizedOptionsErrorMessage, getUnsupportedPuzzleErrorMessage, parseOptions} = require("./options.js");
const {cleanSequence, parseMoves, countMoves} = require("./algs.js");
const {getAlgListHelpMessage} = require("./algCollection.js");
const {mergeMoves} = require("./merging.js");

const getResultOfCommand = (message, language) => {
	let answer = {answerContent: "", answerOptions: {}, errorInCommand: false, addReactions: false};
	if (/^\$(alg|do)(	| |$)/.test(message.content)) { // $alg or $do command
		answer.addReactions = true;
		let resultOfAlgOrDoCommand = getResultOfAlgOrDoCommand(message.content);
		if (resultOfAlgOrDoCommand.unrecognizedPuzzle) {
			answer.answerContent = getUnsupportedPuzzleErrorMessage(resultOfAlgOrDoCommand.unrecognizedPuzzle, language);
			answer.errorInCommand = true;
		} else if (resultOfAlgOrDoCommand.unrecognizedOptions) {
			answer.answerContent = getUnrecognizedOptionsErrorMessage(resultOfAlgOrDoCommand.unrecognizedOptions.join("\n"), language);
			answer.errorInCommand = true;
		} else {
			answer.answerContent = resultOfAlgOrDoCommand.messageContent;
			answer.answerOptions = {files: [{attachment: resultOfAlgOrDoCommand.imageUrl, name: "cubeImage.png"}]};
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

const getResultOfAlgOrDoCommand = command => {
	command = command.replace(/’/g, "'"); // replace wrong apostrophe typography
	let parsedCommand = splitCommand(command);
	let options = parseOptions(parsedCommand.options); // parse options
	if (options.unrecognizedOptions.length || !/^([1-9]|10)$/.test(options.puzzle)) { // problem in options
		return {
			unrecognizedOptions: options.unrecognizedOptions,
			unrecognizedPuzzle: options.puzzle
		};
	} else { // everything is right, continue
		let {moveSequenceForAnswer, moveSequenceForVisualCube} = parseMoves(cleanSequence(parsedCommand.moves)); // parse moves
		if (options.shouldMergeMoves) {
			moveSequenceForAnswer = mergeMoves(moveSequenceForAnswer, +options.puzzle);
		}
		if (options.shouldCountMoves["htm"] || options.shouldCountMoves["stm"] || options.shouldCountMoves["etm"] || options.shouldCountMoves["qtm"]) {
			moveSequenceForAnswer += " (" + countMoves(moveSequenceForAnswer, options.shouldCountMoves).join(", ") + ")"; // add move count if necessary
		}
		return {
			messageContent: moveSequenceForAnswer + (parsedCommand.comments ? " //" + parsedCommand.comments : ""),
			imageUrl: buildImageUrl(moveSequenceForVisualCube, options, parsedCommand.algOrDo)
		};
	}
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
	} else {
		commandObject.options = []; // get options
		commandObject.moves = commandString; // get moves
	}
	return commandObject;
};

const buildImageUrl = (moveSequence, options, algOrDo) => {
	return "http://cube.rider.biz//visualcube.php?fmt=png&bg=t&size=150"
		+ `${options.view === "normal" ? "" : "&view=" + options.view}`
		+ `&pzl=${options.puzzle}`
		+ `&sch=${options.colorScheme}`
		+ `&stage=${options.stage}`
		+ `&${algOrDo === "alg" ? "case" : "alg"}=` // $alg/$do command in AlgBot is respectively case/alg in VisualCube
		+ `${moveSequence.replace(/'/g, "%27").replace(/&/g, "")}`;
};

const getUnrecognizedCommandErrorMessage = (command, language) => {
	if (language === "french") {
		return ":x: Commande non reconnue : " + command;
	} else {
		return ":x: Unrecognized command : " + command;
	}
};

module.exports = {getResultOfCommand};
