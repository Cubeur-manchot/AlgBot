"use strict";

const {algCollection} = require("./algCollection.js");

// sequence parsing

const invertSequence = moves => {
	let invertedSequence = [];
	if (moves === "") {
		return "";
	} else {
		for (let move of moves.split(" ")) {
			if (move.includes("'")) {
				invertedSequence.unshift(move.substring(0, move.length - 1));
			} else {
				invertedSequence.unshift(move + "'");
			}
		}
	}
	return invertedSequence.join(" ");
};

const parseMoves = moves => {
	let {subSequenceBefore, subSequenceAfter, subSequenceFirstInside, subSequenceSecondInside, type, factor} = parseSequenceStructure(moves.join(" "));
	subSequenceBefore = subSequenceBefore.split(" ").filter(x => {return x !== ""});
	subSequenceAfter = subSequenceAfter.split(" ").filter(x => {return x !== ""});
	subSequenceFirstInside = subSequenceFirstInside.split(" ").filter(x => {return x !== ""});
	subSequenceSecondInside = subSequenceSecondInside.split(" ").filter(x => {return x !== ""});
	let {moveSequenceForAnswer, moveSequenceForVisualCube} =
		getMoveSequenceFromStructure(type, factor, subSequenceBefore, subSequenceAfter, subSequenceFirstInside, subSequenceSecondInside);
	return {moveSequenceForAnswer, moveSequenceForVisualCube};
};

const parseSimpleSequence = moves => {
	let moveSequence = {moveSequenceForAnswer: [], moveSequenceForVisualCube: []};
	for (let move of moves) {
		let {movesForAnswer, movesForVisualCube} = deployMove(move);
		moveSequence.moveSequenceForAnswer.push(movesForAnswer);
		moveSequence.moveSequenceForVisualCube.push(movesForVisualCube);
	}
	moveSequence.moveSequenceForAnswer = moveSequence.moveSequenceForAnswer.join(" ");
	moveSequence.moveSequenceForVisualCube = moveSequence.moveSequenceForVisualCube.join(" ");
	return moveSequence;
};

const parseSequenceStructure = movesString => {
	let subSequenceBefore = "", subSequenceAfter = "", subSequenceFirstInside = "", subSequenceSecondInside = "";
	let type = "simple"; // simple, commutator, conjugate, multiple
	let factor = "";
	for (let i = 0; i < movesString.length; i++) { // look for ( or [
		if (movesString[i] === "(") { // found (, now look for )
			type = "multiple";
			let depth = 1;
			for (i++; i < movesString.length; i++) {
				if (movesString[i] === ")" && depth === 1) { // found )
					factor = movesString.substring(i + 1).match(/^\d*'?/);
					if (factor === null) {
						factor = "";
						subSequenceAfter = movesString.substring(i + 1);
					} else {
						factor = factor[0];
						subSequenceAfter = movesString.substring(i + factor.length + 1);
					}
					i = movesString.length;
				} else {
					if (movesString[i] === "(") {
						depth++;
					} else if (movesString[i] === ")") {
						depth--;
					}
					subSequenceFirstInside += movesString[i];
				}
			}
		} else if (movesString[i] === "[") { // found [, now look for , or :
			let depth = 1;
			for (i++; i < movesString.length; i++) {
				if ((movesString[i] === "," || movesString[i] === ":") && depth === 1) { // found , or :, now look for ]
					type = movesString[i] === "," ? "commutator" : "conjugate";
					for (i++; i < movesString.length; i++) {
						if (movesString[i] === "]" && depth === 1) { // found ]
							subSequenceAfter = movesString.substring(i + 1);
							i = movesString.length;
						} else {
							if (movesString[i] === "[") {
								depth++;
							} else if (movesString[i] === "]") {
								depth--;
							}
							subSequenceSecondInside += movesString[i];
						}
					}
				} else {
					if (movesString[i] === "[") {
						depth++;
					} else if (movesString[i] === "]") {
						depth--;
					}
					subSequenceFirstInside += movesString[i];
				}
			}
			i = movesString.length;
		} else {
			subSequenceBefore += movesString[i];
		}
	}
	return {subSequenceBefore, subSequenceAfter, subSequenceFirstInside, subSequenceSecondInside, type, factor};
};

const getMoveSequenceFromStructure = (type, factor, subSequenceBefore, subSequenceAfter, subSequenceFirstInside, subSequenceSecondInside) => {
	let moveSequenceForAnswer = "", moveSequenceForVisualCube = "";
	if (type === "simple") {
		return parseSimpleSequence(subSequenceBefore);
	} else {
		let moveSequenceBefore = parseSimpleSequence(subSequenceBefore);
		let moveSequenceAfter = parseMoves(subSequenceAfter);
		switch (type) {
			case "multiple":
				let moveSequenceInside = parseMoves(subSequenceFirstInside);
				let factorIsInverse = factor.includes("'");
				let factorNumber = factorIsInverse ? factor.substring(0, factor.length - 1) : factor;
				if (factorNumber === "") {
					factorNumber = 1;
				}
				if (factorIsInverse) {
					moveSequenceInside.moveSequenceForAnswer = invertSequence(moveSequenceInside.moveSequenceForAnswer);
					moveSequenceInside.moveSequenceForVisualCube = invertSequence(moveSequenceInside.moveSequenceForVisualCube);
				}
				moveSequenceForAnswer = moveSequenceBefore.moveSequenceForAnswer + " "
					+ (moveSequenceInside.moveSequenceForAnswer + " ").repeat(factorNumber)
					+ moveSequenceAfter.moveSequenceForAnswer;
				moveSequenceForVisualCube = moveSequenceBefore.moveSequenceForVisualCube + " "
					+ (moveSequenceInside.moveSequenceForVisualCube + " ").repeat(factorNumber)
					+ moveSequenceAfter.moveSequenceForVisualCube;
				break;
			case "conjugate":
				let moveSequenceSetup = parseMoves(subSequenceFirstInside);
				let moveSequenceSetuped = parseMoves(subSequenceSecondInside);
				moveSequenceForAnswer = moveSequenceBefore.moveSequenceForAnswer + " " + moveSequenceSetup.moveSequenceForAnswer + " "
					+ moveSequenceSetuped.moveSequenceForAnswer + " " + invertSequence(moveSequenceSetup.moveSequenceForAnswer) + " "
					+ moveSequenceAfter.moveSequenceForAnswer;
				moveSequenceForVisualCube = moveSequenceBefore.moveSequenceForVisualCube + " " + moveSequenceSetup.moveSequenceForVisualCube + " "
					+ moveSequenceSetuped.moveSequenceForVisualCube + " " + invertSequence(moveSequenceSetup.moveSequenceForVisualCube) + " "
					+ moveSequenceAfter.moveSequenceForVisualCube;
				break;
			case "commutator":
				let moveSequenceFirst = parseMoves(subSequenceFirstInside);
				let moveSequenceSecond = parseMoves(subSequenceSecondInside);
				moveSequenceForAnswer = moveSequenceBefore.moveSequenceForAnswer + " " + moveSequenceFirst.moveSequenceForAnswer + " "
					+ moveSequenceSecond.moveSequenceForAnswer + " " + invertSequence(moveSequenceFirst.moveSequenceForAnswer) + " "
					+ invertSequence(moveSequenceSecond.moveSequenceForAnswer) + " " + moveSequenceAfter.moveSequenceForAnswer;
				moveSequenceForVisualCube = moveSequenceBefore.moveSequenceForAnswer + " " + moveSequenceFirst.moveSequenceForVisualCube + " "
					+ moveSequenceSecond.moveSequenceForVisualCube + " " + invertSequence(moveSequenceFirst.moveSequenceForVisualCube) + " "
					+ invertSequence(moveSequenceSecond.moveSequenceForVisualCube) + " " + moveSequenceAfter.moveSequenceForVisualCube;
				break;
			default:
				// this case should not happen
				break;
		}
	}
	moveSequenceForAnswer = moveSequenceForAnswer.trim();
	moveSequenceForVisualCube = moveSequenceForVisualCube.trim();
	return {moveSequenceForAnswer, moveSequenceForVisualCube};
};

const deployMove = move => {
	let moveLower = move.toLowerCase();
	let moveSequence = {movesForAnswer: "", movesForVisualCube: ""};
	if (move.startsWith("$")) { // AlgBot commands
		// don't insert the move, else AlgBot would answer to itself
	} else if (moveLower.includes("pll_")) { // move is actually a PLL
		moveSequence.movesForAnswer = algCollection.PLLCollection[moveLower];
		moveSequence.movesForVisualCube = algCollection.PLLCollection[moveLower];
	} else if (moveLower.includes("oll_")) { // move is actually an OLL
		moveSequence.movesForAnswer = algCollection.OLLCollection[moveLower];
		moveSequence.movesForVisualCube = algCollection.OLLCollection[moveLower];
	} else if (moveLower.includes("cmll_")) { // move is actually a CMLL
		moveSequence.movesForAnswer = algCollection.CMLLCollection[moveLower];
		moveSequence.movesForVisualCube = algCollection.CMLLCollection[moveLower];
	} else if (moveLower.includes("sune") || moveLower.includes("niklas")) { // move is a basic alg
		moveSequence.movesForAnswer = algCollection.basicAlgsCollection[moveLower];
		moveSequence.movesForVisualCube = algCollection.basicAlgsCollection[moveLower];
	} else if (moveLower.includes("parity")) { // move is a 4x4 parity
		moveSequence.movesForAnswer = algCollection.parity4x4x4Collection[moveLower];
		moveSequence.movesForVisualCube = algCollection.parity4x4x4Collection[moveLower];
	} else if (moveLower.includes("edge") || moveLower.includes("sexy")) { // move is a trigger or composition
		moveSequence.movesForAnswer = algCollection.triggerCollection[moveLower];
		moveSequence.movesForVisualCube = algCollection.triggerCollection[moveLower];
	} else if (/^[0-9].*/.test(move)) { // slice moves start with a number
		moveSequence.movesForAnswer = move;
		if (move.includes("-")) {
			let firstSliceNumber = move[0];
			let secondSliceNumber = move[2];
			let {biggerSliceNumber, smallerSliceNumber} = {
				biggerSliceNumber: Math.max(firstSliceNumber, secondSliceNumber),
				smallerSliceNumber: Math.min(firstSliceNumber, secondSliceNumber)
			};
			moveSequence.movesForVisualCube = biggerSliceNumber + move.substring(3);
			if (smallerSliceNumber > 1 && move.length > 3) {
				if (move.includes("'")) {
					moveSequence.movesForVisualCube += " " + (smallerSliceNumber - 1) + move.substring(3, move.length - 1);
				} else {
					moveSequence.movesForVisualCube += " " + (smallerSliceNumber - 1) + move.substring(3, move.length) + "'";
				}
				moveSequence.movesForVisualCube = moveSequence.movesForVisualCube.replace(/w/g, "");
			}
		} else {
			if (move.includes("w")) { // basic outer block move
				moveSequence.movesForVisualCube = move;
			} else { // slice move with only 1 slice
				moveSequence.movesForVisualCube = move;
				let sliceNumber = move[0];
				if (sliceNumber > 1 && move.length > 1) {
					if (move.includes("'")) {
						moveSequence.movesForVisualCube += " " + (sliceNumber - 1) + move.substring(1, move.length - 1);
					} else {
						moveSequence.movesForVisualCube += " " + (sliceNumber - 1) + move.substring(1, move.length) + "'";
					}
				}
			}
		}
	} else { // normal move
		moveSequence.movesForAnswer = move;
		moveSequence.movesForVisualCube = move;
	}
	return moveSequence;
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
	let result = [];
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
	for (let metric of ["htm", "stm", "etm", "qtm"]) {
		if (shouldCountMoves[metric]) {
			result.push(`${moveCount[metric]} ${metric.toUpperCase()}`);
		}
	}
	return result;
};

// sequence cleaning

const cleanSequence = moveSequence => {
	let moveSequenceWork = moveSequence.
		replace(/'/g, "' "). // split by apostrophe
		split(" "). // split by space
		filter(string => { return string !== ""; }); // remove empty moves
	let moveSequenceOutput = [];
	for (let subsequence of moveSequenceWork) {
		if (subsequence.match(/(p|o|cm)ll_|sune|parity|niklas|sexy|edge/gi)) {
			moveSequenceOutput.push(subsequence); // consider the whole word as a single move (will be fully parsed later)
		} else {
			moveSequenceOutput.push(...splitSequence(subsequence, [
				/[MESxyz][0-9]?'?/g, // moves of the form M2, M or x2 or x
				/[0-9]-[0-9][RUFLDB]w?[0-9]'?(?!-)/g, // moves of the form 2-3Rw2, 2-3R2, not followed by a -
				/[0-9]-[0-9][RUFLDB]w?'?/g, // moves of the form 2-3Rw. Note : if a number follows this sequence, it will be treated with the rest of the sequence
				/[0-9]?(?:[RUFLDB]w?|[rufldb])[0-9]?'?/g, // moves of the form 2Rw2, 2Rw, Rw2, Rw, 2R2, 2R, R2, R, 2r2, 2r, r2, r. Note : the matching is greedy from left
			], 0));
		}
	}
	return moveSequenceOutput.filter(string => { return string !== ""; }); // remove empty moves
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

module.exports = {cleanSequence, parseMoves, parseOneMove, countMoves, getSuffixFromTurnAngle, getSuffixFromOppositeTurnAngle, getTurnSliceNumbersAndTurnAngle};
