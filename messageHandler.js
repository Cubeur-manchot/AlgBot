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
	let result = {puzzle: "3", stage: "pll", view: undefined, colorScheme: "wrgyob", unrecognizedOptions: []}; // default parameters
	for (let option of options) {
		if (option === "-yellow") {
			result.colorScheme = "yogwrb";
		} else if (isPuzzleOption(option)) {
			result.puzzle = getPuzzleFromOption(option);
		} else if (isViewOption(option)) {
			result.view = option.slice(1);
		} else {
			result.unrecognizedOptions.push(option);
		}
	}
	if (result.view === undefined) {
		result.view = "plan";
	}
	return result;
};

const isViewOption = option => {
	return /^-(plan|normal|trans)$/i.test(option);
};

const isPuzzleOption = option => {
	return /^-(\d+|(mega|kilo)(minx)?|sq1|sk(ew|we)b)$/i.test(option);
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
	let options = messageWords.filter(word => word.startsWith("-"));
	let {colorScheme, puzzle, view} = parseOptions(options);
	let moves = messageWords.filter(word => !word.startsWith("-"));
	let moveSequence = parseMoves(moves);
	let messageArray = command.split(" "),
		imageUrl, stage, unrecognizedOptions = [], oldView;
	for (let word of messageArray.slice(1)) {
		if (word.startsWith("-")) { // option
			let reducedWord = word.slice(1).toLowerCase();
			if (reducedWord === "fl" || reducedWord === "f2l" || reducedWord === "ll" || reducedWord === "cll"
				|| reducedWord === "ell" || reducedWord === "oll" || reducedWord === "ocll" || reducedWord === "oell"
				|| reducedWord === "coll" || reducedWord === "coell" || reducedWord === "wv" || reducedWord === "vh"
				|| reducedWord === "els" || reducedWord === "cls" || reducedWord === "cmll" || reducedWord === "cross"
				|| reducedWord === "f2l_3" || reducedWord === "f2l_2" || reducedWord === "f2l_sm" || reducedWord === "f2l_1"
				|| reducedWord === "f2b" || reducedWord === "line" || reducedWord === "2x2x2" || reducedWord === "2x2x3") {
				stage = reducedWord;
				if (oldView === undefined) { // sets view only if it's not already defined
					if (reducedWord === "ll" || reducedWord === "cll" || reducedWord === "ell" || reducedWord === "oll"
						|| reducedWord === "ocll" || reducedWord === "oell" || reducedWord === "coll" || reducedWord === "coell"
						|| reducedWord === "wv" || reducedWord === "cmll") {
						oldView = "&view=plan";
					} else {
						oldView = "";
					}
				}
			} else if (reducedWord === "ollcp") {
				stage = "coll";
				if (oldView === undefined) { // sets view only if it's not already defined
					oldView = "&view=plan";
				}
			} else if (reducedWord === "zbll" || reducedWord === "1lll") {
				stage = "pll";
				if (oldView === undefined) { // sets view only if it's not already defined
					oldView = "&view=plan";
				}
			} else if (reducedWord === "zbls") {
				stage = "vh";
				if (oldView === undefined) { // sets view only if it's not already defined
					oldView = "";
				}
			}
		}
	}
	if (stage === undefined) {
		stage = "pll";
	}
	if (/^([1-9]|10)$/.test(puzzle)) { // cubes (1-10)
		imageUrl = "http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150" + (view === "normal" ? "" : "&view=" + view) + "&pzl=" + puzzle
			+ "&sch=" + colorScheme + "&stage=" + stage + "&" + caseOrAlg + "=" + moveSequence.replace(/'/g, "%27");
		return {messageContent: moveSequence + (comments ? "//" + comments : ""), imageUrl: imageUrl, unrecognizedOptions: unrecognizedOptions, puzzleIsRecognized: true};
	} else { // puzzle not yet supported
		return {puzzleIsRecognized: false, puzzle: puzzle};
	}
};

module.exports = {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotMessage, parseTheCommand};
