"use strict";

const {getGeneralHelpMessage} = require("./help.js");
const {getOptionsHelpMessage, getUnrecognizedOptionsErrorMessage, getUnsupportedPuzzleErrorMessage, parseOptions} = require("./options.js");
const {buildMoveSequenceForVisualCube, parseMoves, countMoves, getBadParsingErrorMessage} = require("./algs.js");
const {buildEmbed} = require("./messageHandler.js");
const {getAlgListHelpMessage} = require("./algCollection.js");
const {mergeMoves} = require("./merging.js");

const getResultOfCommand = (message, language) => {
	let answer = {errorInCommand: false, isAlgOrDoCommandWithoutError: false};
	if (/^\$(alg|do)(	| |$)/.test(message.content)) { // $alg or $do command
		let resultOfAlgOrDoCommand = getResultOfAlgOrDoCommand(message.content);
		if (resultOfAlgOrDoCommand.unrecognizedPuzzle) {
			answer.answerTextContent = getUnsupportedPuzzleErrorMessage(resultOfAlgOrDoCommand.unrecognizedPuzzle, language);
			answer.errorInCommand = true;
		} else if (resultOfAlgOrDoCommand.unrecognizedOptions) {
			answer.answerTextContent = getUnrecognizedOptionsErrorMessage(resultOfAlgOrDoCommand.unrecognizedOptions.join("\n"), language);
			answer.errorInCommand = true;
		} else if (resultOfAlgOrDoCommand.badParsing) {
			answer.answerTextContent = getBadParsingErrorMessage(language);
			answer.errorInCommand = true;
		} else { // normal case, no error
			answer.isAlgOrDoCommandWithoutError = true;
			answer.answerEmbed = buildEmbed(resultOfAlgOrDoCommand);
		}
	} else if (message.content === "$help") { // $help command
		answer.answerTextContent = getGeneralHelpMessage(language);
	} else if (message.content === "$options") { // $options command
		answer.answerTextContent = getOptionsHelpMessage(language);
	} else if (message.content === "$alglist") { // $alglist command
		answer.answerTextContent = getAlgListHelpMessage(language);
	} else { // unrecognized command
		answer.answerTextContent = getUnrecognizedCommandErrorMessage(message.content.split(" ")[0], language);
		answer.errorInCommand = true;
	}
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
		let moveSequenceForAnswer = parseMoves(parsedCommand.moves);
		if (moveSequenceForAnswer === "Error : Bad parsing") {
			return {
				badParsing: true
			};
		} else {
			let moveSequenceForVisualCubeNew = buildMoveSequenceForVisualCube(moveSequenceForAnswer);
			if (options.shouldMergeMoves) {
				moveSequenceForAnswer = mergeMoves(moveSequenceForAnswer, +options.puzzle);
			}
			if (options.shouldCountMoves["htm"] || options.shouldCountMoves["stm"] || options.shouldCountMoves["etm"] || options.shouldCountMoves["qtm"]) {
				moveSequenceForAnswer = moveSequenceForAnswer.join(" ") + countMoves(moveSequenceForAnswer, options.shouldCountMoves);
			} else {
				moveSequenceForAnswer = moveSequenceForAnswer.join(" ");
			}
			return {
				moveSequence: moveSequenceForAnswer,
				imageUrl: buildImageUrl(moveSequenceForVisualCubeNew, options, parsedCommand.algOrDo),
				puzzle: options.puzzle,
				algOrDo: parsedCommand.algOrDo
			};
		}
	}
};

const splitCommand = commandString => {
	let commandObject = {};
	let indexOfSpace = commandString.indexOf(" ");
	commandObject.algOrDo = indexOfSpace === 4 ? "alg" : "do"; // get alg or do
	commandString = commandString.substring(indexOfSpace); // remove first word
	let indexOfComments = commandString.indexOf("//");
	if (indexOfComments !== -1) {
		commandObject.comments = commandString.slice(indexOfComments + 2); // get comments
		commandString = commandString.substring(0, indexOfComments); // remove comments
	}
	let indexOfOptions = commandString.indexOf(" -");
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
	return "http://visualcube/visualcube.php?fmt=png&bg=t&size=150"
		+ `${options.view === "normal" ? "" : "&view=" + options.view}`
		+ `&pzl=${options.puzzle}`
		+ `&sch=${options.colorScheme}`
		+ (options.faceletDefinition ? `&fd=${options.faceletDefinition}` : `&stage=${options.stage}`)
		+ `&${algOrDo === "alg" ? "case" : "alg"}=` // $alg/$do command in AlgBot is respectively case/alg in VisualCube
		+ `${moveSequence.join("%20").replace(/'/g, "%27")}`;
};

const getUnrecognizedCommandErrorMessage = (command, language) => {
	if (language === "french") {
		return ":x: Commande non reconnue : " + command;
	} else {
		return ":x: Unrecognized command : " + command;
	}
};

module.exports = {getResultOfCommand};
