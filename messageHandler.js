"use strict";

const {parseMoves} = require("./algs.js");
const {parseOptions} = require("./options.js");

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

const parseTheCommand = command => {
	let comments = command.split("//").slice(1).join("");
	command = command.split("//")[0]; // removes comments
	let messageWords = command.split(" ");
	let caseOrAlg = messageWords[0] === "$alg" ? "case" : "do"; // $alg/$do command in AlgBot is respectively case/alg in VisualCube
	messageWords = messageWords.slice(1); // remove first word
	let moveSequence = parseMoves(messageWords.filter(word => !word.startsWith("-"))); // parse moves
	let {stage, view, colorScheme, puzzle, unrecognizedOptions} = parseOptions(messageWords.filter(word => word.startsWith("-"))); // parse options
	view = view === "normal" ? "" : `&view=${view}`; // adjust view for url
	if (/^([1-9]|10)$/.test(puzzle)) { // cubes (1-10)
		return {
			messageContent: moveSequence + (comments ? "//" + comments : ""),
			imageUrl: `http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150${view}&pzl=${puzzle}` +
				`&sch=${colorScheme}&stage=${stage}&${caseOrAlg}=${moveSequence.replace(/'/g, "%27")}`,
			unrecognizedOptions: unrecognizedOptions,
			puzzleIsRecognized: true
		};
	} else { // puzzle not yet supported
		return {puzzleIsRecognized: false, puzzle: puzzle};
	}
};

module.exports = {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotMessage, parseTheCommand};
