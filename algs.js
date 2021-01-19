"use strict";

const {algCollection} = require("./algCollection.js");

// sequence parsing

const parseMoves = movesString => {
	let newDepthObject = type => { return { type: type, subsequenceString: "", moves: [[]] } };
	let pushAtDepth = (content, depth) => { informationAtDepth[depth].moves[informationAtDepth[depth].moves.length - 1].push(...content); };
	let depth = 0;
	let informationAtDepth = [newDepthObject("")];
	for (let characterIndex = 0; characterIndex < movesString.length; characterIndex++) {
		let character = movesString[characterIndex];
		if (character === "[" || character === "(") { // opening subsequence
			pushAtDepth(parseSimpleSequence(informationAtDepth[depth].subsequenceString), depth); // append current moves
			informationAtDepth[depth].subsequenceString = "";
			depth++;
			informationAtDepth[depth] = newDepthObject(character);
		} else if (character === "]") { // closing subsequence (brackets)
			if (informationAtDepth[depth].type === "[:") { // [A : B]
				pushAtDepth(informationAtDepth[depth].moves[0], depth - 1); // A
				pushAtDepth(informationAtDepth[depth].moves[1], depth - 1); // begin of B
				pushAtDepth(parseSimpleSequence(informationAtDepth[depth].subsequenceString), depth - 1); // end of B
				pushAtDepth(invertSequence(informationAtDepth[depth].moves[0]), depth - 1); // A'
				depth--;
			} else if (informationAtDepth[depth].type === "[,") { // [A, B]
				pushAtDepth(informationAtDepth[depth].moves[0], depth - 1); // A
				let secondSubsequenceMoves = parseSimpleSequence(informationAtDepth[depth].subsequenceString);
				pushAtDepth(informationAtDepth[depth].moves[1], depth - 1); // begin of B
				pushAtDepth(secondSubsequenceMoves, depth - 1); // end of B
				pushAtDepth(invertSequence(informationAtDepth[depth].moves[0]), depth - 1); // A'
				pushAtDepth(invertSequence(secondSubsequenceMoves), depth - 1); // (end of B)'
				pushAtDepth(invertSequence(informationAtDepth[depth].moves[1]), depth - 1); // (begin of B)'
				depth--;
			} else {
				return "Error : Bad parsing";
			}
		} else if (character === ")") { // closing subsequence (parenthesis)
			pushAtDepth(parseSimpleSequence(informationAtDepth[depth].subsequenceString), depth); // append current moves
			let factor = movesString.slice(characterIndex + 1).match(/^\d*'?/)[0];
			characterIndex += factor.length;
			let isInverse = factor.includes("'");
			if (isInverse) {
				factor = factor.slice(0, -1); // remove apostrophe at the end
				informationAtDepth[depth].moves[0] = invertSequence(informationAtDepth[depth].moves[0]);
			}
			factor = factor === "" ? 1 : +factor;
			for (let time = 0; time < factor; time++) {
				pushAtDepth(informationAtDepth[depth].moves[0], depth - 1);
			}
			depth--;
		} else if (character === "," || character === ":") { // middle of subsequence
			if (informationAtDepth[depth].type === "[") {
				informationAtDepth[depth].type += character;
				informationAtDepth[depth].moves[0].push(...parseSimpleSequence(informationAtDepth[depth].subsequenceString));
				informationAtDepth[depth].moves[1] = [];
				informationAtDepth[depth].subsequenceString = "";
			} else {
				return "Error : Bad parsing";
			}
		} else { // normal characters, to be parsed as a simple sequence
			informationAtDepth[depth].subsequenceString += character;
		}
	}
	if (depth !== 0) {
		return "Error : Bad parsing";
	}
	pushAtDepth(parseSimpleSequence(informationAtDepth[0].subsequenceString), 0);
	return informationAtDepth[0].moves[0];
};

const parseSimpleSequence = movesString => {
	let wordList = movesString.replace(/'/g, "' ").split(" ").filter(string => { return string !== ""; });
	let moveArray = [];
	for (let word of wordList) {
		if (/(p|o|cm)ll_|sune|parity|niklas|(back|left)?(double|triple)?(anti)?sexy|(h|sl)edge/gi.test(word)) {
			let wordLowerWithoutSuffix = word.toLowerCase().replace(/[0-9]*'?$/g,"");
			let moveSequenceForWordString;
			if (/(p|o|cm)ll_/.test(wordLowerWithoutSuffix)) { // move is either a PLL, or an OLL, or a CMLL
				if (wordLowerWithoutSuffix.includes("oll")) { // OLL is particular because it ends with a number
					wordLowerWithoutSuffix = word.toLowerCase().replace(/'$/g,""); // only removes apostrophe at the end, keep digits
				}
				moveSequenceForWordString = algCollection[wordLowerWithoutSuffix.match(/(p|o|cm)ll/)[0].toUpperCase() + "Collection"][wordLowerWithoutSuffix];
			} else if (wordLowerWithoutSuffix.includes("sune") || wordLowerWithoutSuffix.includes("niklas")) { // move is a basic alg
				moveSequenceForWordString = algCollection.basicAlgsCollection[wordLowerWithoutSuffix];
			} else if (wordLowerWithoutSuffix.includes("parity")) { // move is a 4x4 parity
				moveSequenceForWordString = algCollection.parity4x4x4Collection[wordLowerWithoutSuffix];
			} else if (wordLowerWithoutSuffix.includes("edge") || wordLowerWithoutSuffix.includes("sexy")) { // move is a trigger or composition
				moveSequenceForWordString = algCollection.triggerCollection[wordLowerWithoutSuffix];
			} else { // ignore word
				break;
			}
			let moveSequenceForWordArray = moveSequenceForWordString.split(" ");
			if (word.includes("'")) { // trigger has an apostrophe, it must be inverted
				moveSequenceForWordArray = invertSequence(moveSequenceForWordArray);
			}
			if (/[0-9]+'?$/.test(word) && !wordLowerWithoutSuffix.includes("oll")) { // trigger has a number, it must be repeated, except OLL which natively have this number
				let factor = word.match(/[0-9]+(?='?)/)[0];
				let factorizedMoveSequenceForWordArray = [];
				for (let time = 0; time < factor; time++) {
					factorizedMoveSequenceForWordArray.push(...moveSequenceForWordArray);
				}
				moveSequenceForWordArray = factorizedMoveSequenceForWordArray;
			}
			moveArray.push(...moveSequenceForWordArray);
		} else {
			moveArray.push(...splitSequenceWithPatternList(word, [
				/[MESxyz][0-9]?'?/g, // moves of the form M2, M or x2 or x
				/[0-9]-[0-9][RUFLDB]w?[0-9]'?(?!-)/g, // moves of the form 2-3Rw2, 2-3R2, not followed by a -
				/[0-9]-[0-9][RUFLDB]w?'?/g, // moves of the form 2-3Rw. Note : if a number follows this sequence, it will be treated with the rest of the sequence
				/[0-9]?(?:[RUFLDB]w?|[rufldb])[0-9]?'?/g, // moves of the form 2Rw2, 2Rw, Rw2, Rw, 2R2, 2R, R2, R, 2r2, 2r, r2, r. Note : the matching is greedy from left
			], 0));
		}
	}
	return moveArray;
};

const splitSequenceWithPatternList = (moveSequenceString, patternList, priority) => {
	if (moveSequenceString === "") {
		return [];
	} else if (priority === patternList.length) {
		return []; // ignore remaining characters
	} else {
		let moveSequenceArray = [];
		let matches = moveSequenceString.match(patternList[priority]); // all matching subsequences
		let antiMatches = moveSequenceString.split(patternList[priority]); // all subsequences between matching ones
		let nbMatches = matches === null ? 0 : matches.length;
		if (nbMatches !== 0) {
			for (let matchIndex = 0; matchIndex < nbMatches; matchIndex++) {
				moveSequenceArray.push(...splitSequenceWithPatternList(antiMatches[matchIndex], patternList, priority + 1));
				moveSequenceArray.push(matches[matchIndex]);
			}
		}
		moveSequenceArray.push(...splitSequenceWithPatternList(antiMatches[nbMatches], patternList, priority + 1)); // antiMatches has always 1 more element than matches
		return moveSequenceArray;
	}
};

// sequence manipulating

const invertSequence = moves => {
	let invertedSequence = [];
	for (let move of moves) {
		invertedSequence.unshift(invertMove(move));
	}
	return invertedSequence;
};

const invertMove = move => {
	if (move.includes("'")) {
		return move.slice(0, -1);
	} else {
		return move + "'";
	}
};

const buildMoveSequenceForVisualCube = moveSequence => {
	let moveSequenceForVisualCube = [];
	for (let move of moveSequence) {
		if (/^[0-9]/.test(move)) { // move of the form 2-4Rw', 3R2 or 3Rw2
			if (/^[0-9]-[0-9]/.test(move)) { // move of the form 2-4Rw'
				let {biggerSliceNumber, smallerSliceNumber} = {
					biggerSliceNumber: Math.max(move[0], move[2]),
					smallerSliceNumber: Math.min(move[0], move[2])
				};
				moveSequenceForVisualCube.push(biggerSliceNumber + move.substring(3)); // keep bigger block identical
				if (smallerSliceNumber > 1 && move.length > 3) {
					moveSequenceForVisualCube.push(invertMove(smallerSliceNumber - 1 + move.substring(3).replace("w", ""))); // add smaller move in reverse sense
				} // else move is weird, ignore reverse sense move
			} else { // move of the form 3R2 or 3Rw2
				moveSequenceForVisualCube.push(move); // keep bigger block identical
				if (!move.includes("w")) { // move of the form 3R2
					let sliceNumber = move[0];
					moveSequenceForVisualCube.push(invertMove(sliceNumber - 1 + move.substring(1).replace("w", ""))); // add smaller move in reverse sense
				}
			}
		} else { // normal move
			moveSequenceForVisualCube.push(move);
		}
	}
	return moveSequenceForVisualCube;
};

// move counting

const countMoves = (moveSequence, shouldCountMoves) => {
	let moveCount = [];
	if (moveSequence.length === 0) {
		moveCount["htm"] = 0;
		moveCount["stm"] = 0;
		moveCount["etm"] = 0;
		moveCount["qtm"] = 0;
	} else {
		let simpleMovesCount = 0, quarterSimpleMovesCount = 0, sliceMovesCount = 0, quarterSliceMovesCount = 0, rotationMovesCount = 0;
		for (let move of moveSequence) {
			if (/[xyz][0-9]?'?/g.test(move)) { // moves of the form x
				rotationMovesCount++;
			} else if (/[MES][0-9]?'?/g.test(move) // moves of the form M
				|| /[2-9]-[2-9][RUFLDB]w?[0-9]?'?/g.test(move) // moves of the form 2-3Rw
				|| /(?<!-)[2-9][RUFLDB](?!w)[0-9]?'?/g.test(move)) { // moves of the form 2R, without a "-" before, not followed by a "w"
				sliceMovesCount++;
				quarterSliceMovesCount += /[0-9]'?$/g.test(move) ? +move.replace("'", "").match(/[0-9]$/)[0] : 1;
			} else if (/([01]-[0-9]|[0-9]-[01])[RUFLDB]w?[0-9]?'?/g.test(move) // moves of the form 1-3Rw2' or 3-1Rw2'
				|| /(?<!-)[01][RUFLDB]w?[0-9]?'?/g.test(move) // moves of the form 1R, without a "-" before
				|| /(?<!-)[2-9]?([RUFLDB]w|[rufldb])[0-9]?'?/g.test(move) // moves of the form 3Rw or 3r, without a "-" before
				|| /(?<![0-9])[RUFDLB](?!w)[0-9]?'?/g.test(move)) { // moves of the form R, without a digit before, not followed by a "w"
				simpleMovesCount++;
				quarterSimpleMovesCount += /[0-9]'?$/g.test(move) ? +move.replace("'", "").match(/[0-9]$/)[0] : 1;
			} // other moves are ignored
		}
		moveCount["htm"] = simpleMovesCount + 2*sliceMovesCount;
		moveCount["stm"] = simpleMovesCount + sliceMovesCount;
		moveCount["etm"] = simpleMovesCount + sliceMovesCount + rotationMovesCount;
		moveCount["qtm"] = quarterSimpleMovesCount + 2*quarterSliceMovesCount;
	}
	let resultArray = [];
	for (let metric of Object.keys(moveCount)) {
		if (shouldCountMoves[metric]) {
			resultArray.push(`${moveCount[metric]} ${metric.toUpperCase()}`);
		}
	}
	return " (" + resultArray.join(", ") + ")";
};

// error messages

const getBadParsingErrorMessage = (language) => {
	if (language === "french") {
		return ":x: Mauvaise structure d'algo";
	} else {
		return ":x: Bad alg structure";
	}
};

module.exports = {parseMoves, buildMoveSequenceForVisualCube, countMoves, getBadParsingErrorMessage};
