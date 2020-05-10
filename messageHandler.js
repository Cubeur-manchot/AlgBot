"use strict";

const {getMoveSequenceFromAlgName} = require("./algs.js");

// general information about message

const messageIsAlgBotCommand = message => {
	return message.content.startsWith("$");
};

const messageIsAlgBotMessage = message => {
	return message.author.username === "AlgBot";
};

const messageIsErrorMessage = message => {
	return message.content.includes("non reconnu");
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

// other

function getInfoFromCommand(command) {
	let messageArray = command.split(" "),
		moveSequence = [], moveSequenceForImageUrl = [], imageUrl, puzzle, stage, caseOrAlg, colorScheme, unrecognizedOptions = [], view;
	if (messageArray[0] === "$do") {
		caseOrAlg = "alg";
	} else {
		caseOrAlg = "case";
	}
	for (let word of messageArray.slice(1)) {
		if (word.startsWith("-")) { // option
			let reducedWord = word.slice(1).toLowerCase();
			if (/^\d+$/.test(reducedWord)) { // word is -number
				puzzle = reducedWord;
			} else if (reducedWord === "megaminx" || reducedWord === "kilominx") {
				puzzle = reducedWord.substring(0, 4);
			} else if (reducedWord === "mega" || reducedWord === "sq1" || reducedWord === "skewb" || reducedWord === "kilo") {
				puzzle = reducedWord;
			} else if (reducedWord === "skweb") {
				puzzle = "skewb";
			} else if (reducedWord === "fl" || reducedWord === "f2l" || reducedWord === "ll" || reducedWord === "cll"
				|| reducedWord === "ell" || reducedWord === "oll" || reducedWord === "ocll" || reducedWord === "oell"
				|| reducedWord === "coll" || reducedWord === "coell" || reducedWord === "wv" || reducedWord === "vh"
				|| reducedWord === "els" || reducedWord === "cls" || reducedWord === "cmll" || reducedWord === "cross"
				|| reducedWord === "f2l_3" || reducedWord === "f2l_2" || reducedWord === "f2l_sm" || reducedWord === "f2l_1"
				|| reducedWord === "f2b" || reducedWord === "line" || reducedWord === "2x2x2" || reducedWord === "2x2x3") {
				stage = reducedWord;
				if (view === undefined) { // sets view only if it's not already defined
					if (reducedWord === "ll" || reducedWord === "cll" || reducedWord === "ell" || reducedWord === "oll"
						|| reducedWord === "ocll" || reducedWord === "oell" || reducedWord === "coll" || reducedWord === "coell"
						|| reducedWord === "wv" || reducedWord === "cmll") {
						view = "&view=plan";
					} else {
						view = "";
					}
				}
			} else if (reducedWord === "ollcp") {
				stage = "coll";
				if (view === undefined) { // sets view only if it's not already defined
					view = "&view=plan";
				}
			} else if (reducedWord === "zbll" || reducedWord === "1lll") {
				stage = "pll";
				if (view === undefined) { // sets view only if it's not already defined
					view = "&view=plan";
				}
			} else if (reducedWord === "zbls") {
				stage = "vh";
				if (view === undefined) { // sets view only if it's not already defined
					view = "";
				}
			} else if (reducedWord === "yellow") {
				colorScheme = "yogwrb";
			} else if (reducedWord === "plan") { // overwrite view
				view = "&view=plan";
			} else if (reducedWord === "normal") { // overwrite view
				view = "";
			} else {
				unrecognizedOptions.push(word);
			}
		} else if (word.includes("_") || word.toLowerCase().includes("une")) { // alg insert (like PLL_F) or sune/antisune
			for (let move of getMoveSequenceFromAlgName(word)) {
				moveSequence.push(move);
				moveSequenceForImageUrl.push(move.replace("'", "%27"));
			}
		} else { // normal move
			moveSequence.push(word);
			moveSequenceForImageUrl.push(word.replace("'", "%27"));
		}
	}
	if (view === undefined) {
		view = "&view=plan";
	}
	if (colorScheme === undefined) {
		colorScheme = "wrgyob";
	}
	if (puzzle === undefined) {
		puzzle = "3";
	}
	if (stage === undefined) {
		stage = "pll";
	}
	if (puzzle === "skewb") {
	} else if (puzzle === "mega") {
		imageUrl = "http://cubiclealgdbimagegen.azurewebsites.net/generator?puzzle=mega&alg=" + moveSequenceForImageUrl.join("");
	} else if (puzzle === "kilo") {
	} else if (puzzle === "sq1") {
	} else { // cube
		imageUrl = "http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150" + view + "&pzl=" + puzzle
			+ "&sch=" + colorScheme + "&stage=" + stage + "&" + caseOrAlg + "=" + moveSequenceForImageUrl.join("");
	}
	return {imageUrl: imageUrl, moveSequence: moveSequence, unrecognizedOptions: unrecognizedOptions};
}

module.exports = {messageIsAlgBotCommand, sendMessageToChannel, deleteMessageAfterSomeSeconds, deleteNextAlgBotMessage, getInfoFromCommand};
