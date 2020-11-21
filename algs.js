"use strict";

const {algCollection} = require("./algCollection.js");

// sequence parsing

const invertMove = move => {
	if (move.includes("'")) {
		return move.slice(0, -1);
	} else {
		return move + "'";
	}
};

const invertSequenceNew = moves => {
	let invertedSequence = [];
	for (let move of moves) {
		invertedSequence.unshift(invertMove(move));
	}
	return invertedSequence;
};

const parseStructureNew = movesString => {
	let newDepthObject = type => { return { type: type, subsequenceString: "", moves: [[]] } };
	let pushAtDepth = (content, depth) => {
		informationAtDepth[depth].moves[informationAtDepth[depth].moves.length - 1].push(...content);
	};
	let depth = 0;
	let informationAtDepth = [newDepthObject("")];
	for (let characterIndex = 0; characterIndex < movesString.length; characterIndex++) {
		let character = movesString[characterIndex];
		if (character === "[" || character === "(") { // opening subsequence
			pushAtDepth(parseMovesNew(informationAtDepth[depth].subsequenceString), depth); // append current moves
			informationAtDepth[depth].subsequenceString = "";
			depth++;
			informationAtDepth[depth] = newDepthObject(character);
		} else if (character === "]") { // closing subsequence (brackets)
			if (informationAtDepth[depth].type === "[:") { // [A : B]
				pushAtDepth(informationAtDepth[depth].moves[0], depth - 1); // A
				pushAtDepth(informationAtDepth[depth].moves[1], depth - 1); // begin of B
				pushAtDepth(parseMovesNew(informationAtDepth[depth].subsequenceString), depth - 1); // end of B
				pushAtDepth(invertSequenceNew(informationAtDepth[depth].moves[0]), depth - 1); // A'
				depth--;
			} else if (informationAtDepth[depth].type === "[,") { // [A, B]
				pushAtDepth(informationAtDepth[depth].moves[0], depth - 1); // A
				let secondSubsequenceMoves = parseMovesNew(informationAtDepth[depth].subsequenceString);
				pushAtDepth(informationAtDepth[depth].moves[1], depth - 1); // begin of B
				pushAtDepth(secondSubsequenceMoves, depth - 1); // end of B
				pushAtDepth(invertSequenceNew(informationAtDepth[depth].moves[0]), depth - 1); // A'
				pushAtDepth(invertSequenceNew(secondSubsequenceMoves), depth - 1); // (end of B)'
				pushAtDepth(invertSequenceNew(informationAtDepth[depth].moves[1]), depth - 1); // (begin of B)'
				depth--;
			} else {
				return "Error : Bad parsing";
			}
		} else if (character === ")") { // closing subsequence (parenthesis)
			pushAtDepth(parseMovesNew(informationAtDepth[depth].subsequenceString), depth); // append current moves
			let factor = movesString.slice(characterIndex + 1).match(/^\d*'?/)[0];
			characterIndex += factor.length;
			let isInverse = factor.includes("'");
			if (isInverse) {
				factor = factor.slice(0, -1); // remove apostrophe at the end
				informationAtDepth[depth].moves[0] = invertSequenceNew(informationAtDepth[depth].moves[0]);
			}
			factor = factor === "" ? 1 : +factor;
			for (let time = 0; time < factor; time++) {
				pushAtDepth(informationAtDepth[depth].moves[0], depth - 1);
			}
			depth--;
		} else if (character === "," || character === ":") { // middle of subsequence
			if (informationAtDepth[depth].type === "[") {
				informationAtDepth[depth].type += character;
				informationAtDepth[depth].moves[0] = parseMovesNew(informationAtDepth[depth].subsequenceString);
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
	pushAtDepth(parseMovesNew(informationAtDepth[0].subsequenceString), 0);
	return informationAtDepth[0].moves[0];
};

const deploySequenceNew = moveSequence => {
	let moveSequenceForAnswer = [];
	for (let move of moveSequence) {
		let deployedMove = deployMoveNew(move);
		moveSequenceForAnswer.push(...deployedMove.movesForAnswer);
	}
	return moveSequenceForAnswer;
};

const buildMoveSequenceForVisualCube = moveSequence => {
	let moveSequenceForVisualCube = [];
	for (let move of moveSequence) {
		if (/^[0-9]/.test(move)) { // move of the form 2-4Rw', 3R2 or 3Rw2
			let movesForVisualCube = [];
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

const deployMoveNew = move => {
	let moveLower = move.toLowerCase();
	if (/^[0-9]/.test(move)) { // move of the form 2-4Rw', 3R2 or 3Rw2
		let movesForAnswer = [move];
		let movesForVisualCube = [];
		if (/^[0-9]-[0-9]/.test(move)) { // move of the form 2-4Rw'
			let {biggerSliceNumber, smallerSliceNumber} = {
				biggerSliceNumber: Math.max(move[0], move[2]),
				smallerSliceNumber: Math.min(move[0], move[2])
			};
			movesForVisualCube.push(biggerSliceNumber + move.substring(3)); // keep bigger block identical
			if (smallerSliceNumber > 1 && move.length > 3) {
				movesForVisualCube.push(invertMove(smallerSliceNumber - 1 + move.substring(3).replace("w", ""))); // add smaller move in reverse sense
			} // else move is weird, ignore return move
		} else { // move of the form 3R2 or 3Rw2
			movesForVisualCube.push(move); // keep bigger block identical
			if (!move.includes("w")) { // move of the form 3R2
				let sliceNumber = move[0];
				movesForVisualCube.push(invertMove(sliceNumber - 1 + move.substring(1).replace("w", ""))); // add smaller move in reverse sense
			}
		}
		return {
			movesForAnswer: movesForAnswer,
			movesForVisualCube: movesForVisualCube
		};
	} else {
		let sequence;
		if (/(p|o|cm)ll_/.test(move)) { // move is either a PLL, or an OLL, or a CMLL
			sequence = algCollection[move.slice(0, -1).toUpperCase() + "Collection"][moveLower];
		} else if (moveLower.includes("sune") || moveLower.includes("niklas")) { // move is a basic alg
			sequence = algCollection.basicAlgsCollection[moveLower];
		} else if (moveLower.includes("parity")) { // move is a 4x4 parity
			sequence = algCollection.parity4x4x4Collection[moveLower];
		} else if (moveLower.includes("edge") || moveLower.includes("sexy")) { // move is a trigger or composition
			sequence = algCollection.triggerCollection[moveLower];
		} else { // normal move
			sequence = move;
		}
		sequence = sequence.split(" ");
		return {
			movesForAnswer: sequence,
			movesForVisualCube: sequence
		};
	}
};

const parseOneMove = move => {
	let movePattern = /[RUFLDBrufldbMESxyz]/g;
	let moveInfo = {
		prefix: move.split(movePattern)[0],
		family:	move.match(movePattern)[0],
		suffix:	move.split(movePattern)[1]
	};
	for (let familyGroup of [/[RLrlMx]/g, /[UDudEy]/g, /[FBfbSz]/g]) {
		if (familyGroup.test(move)) {
			moveInfo.familyGroup = familyGroup + "";
		}
	}
	if (moveInfo.suffix === "") {
		moveInfo.suffix = "1";
	}
	return moveInfo;
};

const getTurnAngleFromSuffix = suffix => {
	suffix = suffix.replace("w", "");
	if (suffix.includes("'")) {
		if (suffix.slice(0, -1) === "") {
			return -1;
		} else {
			return - parseInt(suffix.slice(0, -1));
		}
	} else {
		if (suffix === "") {
			return 1;
		} else {
			return parseInt(suffix);
		}
	}
};

const getSuffixFromTurnAngle = turnAngle => {
	return getSuffixFromTurnAngleModulo(turnAngle % 4 + 4*(turnAngle < 0));
};

const getSuffixFromOppositeTurnAngle = turnAngle => {
	return getSuffixFromTurnAngleModulo(-turnAngle % 4 + 4*(turnAngle > 0));
};

const getSuffixFromTurnAngleModulo = turnAngleModulo => {
	switch (turnAngleModulo) {
		case 0: return "";
		case 1: return "";
		case 2: return "2";
		case 3: return "'";
	}
};

const getTurnSliceNumbersAndTurnAngle = (moveObject, puzzle) => {
	let orientationSense = /[RrUuFfS]/g.test(moveObject.family);
	let isMiddleMove = /[MES]/.test(moveObject.family);
	let hasW = moveObject.family.includes("w");
	let minSliceNumber, maxSliceNumber, turnAngle = getTurnAngleFromSuffix(moveObject.suffix);
	if (isMiddleMove) { // move of the form M2
		let middleSliceNumber = (puzzle + 1)/2;
		minSliceNumber = middleSliceNumber;
		maxSliceNumber = middleSliceNumber;
	} else if (moveObject.prefix.length === 0) { // move of the form R2, Rw2 or r2
		let isSmallLetter = /[rufldb]/.test(moveObject.family);
		minSliceNumber = 1 + (isSmallLetter && puzzle !== 3); // = 2 for r2 on 4x4+, = 1 for r2 on 3x3, R2 and Rw2
		maxSliceNumber = 1 + (isSmallLetter || hasW); // = 1 for R2, 2 for Rw2 and r2
	} else if (moveObject.prefix.length === 1) { // move of the form 2R2, 2Rw2 or 2r2
		let digit = moveObject.prefix;
		minSliceNumber = hasW ? 1 : +digit; // = 1 for 2Rw2, = digit for 2R2 and 2r2
		maxSliceNumber = +digit; // = digit for 2Rw2, 2R2 and 2r2
	} else { // move of the form 2-3Rw2 or 2-3R2
		let firstDigit = +moveObject.prefix[0];
		let secondDigit = +moveObject.prefix[2];
		minSliceNumber = Math.min(firstDigit, secondDigit);
		maxSliceNumber = Math.max(firstDigit, secondDigit);
	}
	if (!orientationSense) {
		turnAngle = -turnAngle;
		minSliceNumber = puzzle + 1 - minSliceNumber; // complement
		maxSliceNumber = puzzle + 1 - maxSliceNumber; // complement
	}
	return {
		minSliceNumber,
		maxSliceNumber,
		turnAngle
	};
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
	for (let metric of ["htm", "stm", "etm", "qtm"]) {
		if (shouldCountMoves[metric]) {
			resultArray.push(`${moveCount[metric]} ${metric.toUpperCase()}`);
		}
	}
	return " (" + resultArray.join(", ") + ")";
};

// sequence cleaning

const parseMovesNew = movesString => {
	let wordList = movesString.replace(/'/g, "' ").split(" ").filter(string => { return string !== ""; });
	let moveArray = [];
	for (let word of wordList) {
		if (word.match(/(p|o|cm)ll_|sune|parity|niklas|sexy|edge/gi)) {
			moveArray.push(word); // consider the whole word as a single move (will be fully parsed later)
		} else {
			moveArray.push(...splitSequence(word, [
				/[MESxyz][0-9]?'?/g, // moves of the form M2, M or x2 or x
				/[0-9]-[0-9][RUFLDB]w?[0-9]'?(?!-)/g, // moves of the form 2-3Rw2, 2-3R2, not followed by a -
				/[0-9]-[0-9][RUFLDB]w?'?/g, // moves of the form 2-3Rw. Note : if a number follows this sequence, it will be treated with the rest of the sequence
				/[0-9]?(?:[RUFLDB]w?|[rufldb])[0-9]?'?/g, // moves of the form 2Rw2, 2Rw, Rw2, Rw, 2R2, 2R, R2, R, 2r2, 2r, r2, r. Note : the matching is greedy from left
			], 0));
		}
	}
	return moveArray;
};

const splitSequence = (moveSequenceString, patternList, priority) => {
	if (moveSequenceString === "") {
		return [];
	} else if (priority === patternList.length) {
		moveSequenceString = moveSequenceString.replace(/(?![,:\[\](]|\)[0-9]*)/g, ""); // keep only characters [ ] , : ( and )\d* which are necessary for structure parsing
		if (moveSequenceString === "") {
			return [];
		} else {
			return [moveSequenceString];
		}
	} else {
		let moveSequenceArray = [];
		let matches = moveSequenceString.match(patternList[priority]); // all matching subsequences
		let antiMatches = moveSequenceString.split(patternList[priority]); // all non-matching subsequences
		let nbMatches = matches === null ? 0 : matches.length;
		if (nbMatches !== 0) {
			for (let matchIndex = 0; matchIndex < nbMatches; matchIndex++) {
				moveSequenceArray.push(...splitSequence(antiMatches[matchIndex], patternList, priority + 1));
				moveSequenceArray.push(matches[matchIndex]);
			}
		}
		moveSequenceArray.push(...splitSequence(antiMatches[nbMatches], patternList, priority + 1)); // antiMatches has always 1 more element than matches
		return moveSequenceArray;
	}
};

// help messages

module.exports = {parseOneMove, buildMoveSequenceForVisualCube, deploySequenceNew, parseStructureNew, countMoves, getSuffixFromTurnAngle, getSuffixFromOppositeTurnAngle, getTurnSliceNumbersAndTurnAngle};
