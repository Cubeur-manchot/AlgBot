"use strict";

const {deployMove} = require("./algs.js");

// general information about message

const messageIsAlgBotCommand = message => {
	return message.content.startsWith("$");
};

const messageIsAlgBotMessage = message => {
	return message.author.username === "AlgBot";
};

const findNextAlgBotMessage = fromMessage => {
	return fromMessage.channel.messages.cache.array().find(message => {
		return messageIsAlgBotMessage(message) && message.createdTimestamp > fromMessage.createdTimestamp; // first AlgBot's message after message
	});
};

// message handling (send/delete)

const sendMessageToChannel = (channel, message, options) => {
	channel.send(message, options)
		.catch(console.error);
};

const deleteMessage = message => {
	if (message) {
		message.delete()
			.catch(error => console.log(error));
	}
};

const deleteMessageAfterSomeSeconds = message => {
	setTimeout(() => deleteMessage(message), 10000);
};

const deleteNextAlgBotMessage = message => {
	deleteMessage(findNextAlgBotMessage(message));
};

// command parsing

const parseMoves = moves => {
	let moveSequence = [];
	for (let move of moves) {
		moveSequence.push(deployMove(move));
	}
	return moveSequence.join(" ");
};

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
				result.view = getViewFromOption(option);
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

const getViewFromOption = option => {
	if (isStageOptionWithPlanView(option)) {
		return "plan";
	} else {
		return "normal";
	}
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

const isStageOptionWithPlanView = option => {
	return /^-(ollcp|(o|oc|oe|co|coe|cm|zb|1l)?ll|wv)$/i.test(option);
};

const isStageOption = option => {
	return isStageOptionWithPlanView(option) || /^-(cross|fl|f2l(_1|_2|_3|_sm)?|(e|c|zb)ls|line|2x2x2|2x2x3|f2b|vh|vls)$/i.test(option);
};

const isViewOption = option => {
	return /^-(plan|normal|trans)$/i.test(option);
};

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

const parseTheCommand = command => {
	let comments = command.split("//").slice(1).join("");
	command = command.split("//")[0]; // removes comments
	let messageWords = command.split(" ");
	let caseOrAlg = messageWords[0] === "$alg" ? "case" : "do"; // $alg/$do command in AlgBot is respectively case/alg in VisualCube
	messageWords = messageWords.slice(1); // remove first word
	let moveSequence = parseMoves(messageWords.filter(word => !word.startsWith("-"))); // parse moves
	let {stage, view, colorScheme, puzzle, unrecognizedOptions} = parseOptions(messageWords.filter(word => word.startsWith("-"))); // parse options
	view = view === "normal" ? "" : `&view=${view}`; // adjust view for url
	moveSequence = moveSequence.replace(/'/g, "%27"); // adjust moveSequence for url
	if (/^([1-9]|10)$/.test(puzzle)) { // cubes (1-10)
		return {
			messageContent: moveSequence + (comments ? "//" + comments : ""),
			imageUrl: `http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150${view}&pzl=${puzzle}` +
				`&sch=${colorScheme}&stage=${stage}&${caseOrAlg}=${moveSequence}`,
			unrecognizedOptions: unrecognizedOptions,
			puzzleIsRecognized: true
		};
	} else { // puzzle not yet supported
		return {puzzleIsRecognized: false, puzzle: puzzle};
	}
};

module.exports = {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotMessage, parseTheCommand};
