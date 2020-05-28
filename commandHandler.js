"use strict";

const {getGeneralHelpMessage} = require("./help.js");
const {getOptionsHelpMessage, parseOptions} = require("./options.js");
const {parseMoves} = require("./algs.js");

const getInfoFromCommand = message => {
	let answer = {answerContent: "", answerOptions: {}, errorInCommand: false, addReactions: false};
	if (message.content.startsWith("$alg") || message.content.startsWith("$do")) {
		answer.addReactions = true;
		let {messageContent, imageUrl, unrecognizedOptions, puzzleIsRecognized, puzzle} = parseTheCommand(message.content);
		if (!puzzleIsRecognized) {
			answer.answerContent = ":x: Puzzle non pris en charge : " + puzzle;
			answer.errorInCommand = true;
		} else if (unrecognizedOptions.length) {
			answer.answerContent = ":x: Option(s) non reconnue(s) :\n" + unrecognizedOptions.join("\n");
			answer.errorInCommand = true;
		} else {
			answer.answerContent = messageContent;
			answer.answerOptions = {files: [{attachment: imageUrl, name: "cubeImage.png"}]};
		}
	} else if (message.content.startsWith("$help")) {
		answer.answerContent = getGeneralHelpMessage(message);
	} else if (message.content.startsWith("$options")) {
		answer.answerContent = getOptionsHelpMessage();
	} else {
		answer.answerContent = ":x: Commande non reconnue : " + message.content.split(" ")[0];
		answer.errorInCommand = true;
	}
	answer.addReactions &= !answer.errorInCommand; // don't react if there is an error in the command
	return answer;
};

const parseTheCommand = command => {
	let comments = command.split("//").slice(1).join("");
	command = command.split("//")[0]; // removes comments
	let messageWords = command.split(" ");
	let caseOrAlg = messageWords[0] === "$alg" ? "case" : "alg"; // $alg/$do command in AlgBot is respectively case/alg in VisualCube
	messageWords = messageWords.slice(1); // remove first word
	let moveSequence = parseMoves(messageWords.filter(word => !word.startsWith("-"))); // parse moves
	let {stage, view, colorScheme, puzzle, unrecognizedOptions} = parseOptions(messageWords.filter(word => word.startsWith("-"))); // parse options
	view = view === "normal" ? "" : `&view=${view}`; // adjust view for url
	if (/^([1-9]|10)$/.test(puzzle)) { // cubes (1-10)
		return {
			messageContent: moveSequence + (comments ? "//" + comments : ""),
			imageUrl: `http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150${view}&pzl=${puzzle}` +
				`&sch=${colorScheme}&stage=${stage}&${caseOrAlg}=${moveSequenceForVisualCube.replace(/'/g, "%27").replace(/&/g, "")}`,
			unrecognizedOptions: unrecognizedOptions,
			puzzleIsRecognized: true
		};
	} else { // puzzle not yet supported
		return {puzzleIsRecognized: false, puzzle: puzzle};
	}
};

module.exports = {getInfoFromCommand};