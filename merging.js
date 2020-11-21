"use strict";

const {parseOneMove, getTurnSliceNumbersAndTurnAngle, getSuffixFromTurnAngle, getSuffixFromOppositeTurnAngle} = require("./algs.js");

const mergeMoves = (moveSequenceArray, puzzle) => {
	if (moveSequenceArray.length <= 1) { // sequence is too small, moves can't be merged
		return moveSequenceArray;
	} else {
		let shouldRecomputeAfter;
		let movesToMergeSplitByCommutingGroup, moveSequenceArrayOutput, parsedMoveSequence = [];
		for (let moveString of moveSequenceArray) {
			parsedMoveSequence.push(parseOneMove(moveString)); // parse prefix, family and suffix on each move
		}
		do {
			shouldRecomputeAfter = false;
			movesToMergeSplitByCommutingGroup = [];
			parsedMoveSequence.forEach(moveObject => { // join moves by commuting groups
				if (movesToMergeSplitByCommutingGroup.length === 0
					|| moveObject.familyGroup !== getLastElementOfArray(getLastElementOfArray(movesToMergeSplitByCommutingGroup)).familyGroup) {
					movesToMergeSplitByCommutingGroup.push([moveObject]);
				} else {
					getLastElementOfArray(movesToMergeSplitByCommutingGroup).push(moveObject);
				}
			});
			moveSequenceArrayOutput = [];
			let lastMove, nextMove, fusionResult = {};
			for (let moveCommutingSubsequence of movesToMergeSplitByCommutingGroup) {
				while (moveCommutingSubsequence.length !== 0) {
					[lastMove, ...moveCommutingSubsequence] = moveCommutingSubsequence;
					if (moveCommutingSubsequence.length !== 0) { // move is not alone in commuting group, try to merge moves
						tryToMergeMoves:
						{
							let nonMergingMoves = [];
							while (moveCommutingSubsequence.length !== 0) {
								[nextMove, ...moveCommutingSubsequence] = moveCommutingSubsequence;
								fusionResult = tryToMergeTwoMoves(lastMove, nextMove, puzzle);
								if (fusionResult.hasCancelled) { // perfect cancellation, just reinitialize arrays and break the loop
									moveCommutingSubsequence = [...nonMergingMoves, ...moveCommutingSubsequence];
									nonMergingMoves = [];
									shouldRecomputeAfter = true;
									break tryToMergeMoves;
								} else if (fusionResult.hasMerged) { // normal fusion, reinitialize arrays and keep trying to merge
									lastMove = fusionResult.moves[0];
									moveCommutingSubsequence = [...nonMergingMoves, ...moveCommutingSubsequence];
									nonMergingMoves = [];
								} else { // no merge, keep trying to merge
									nonMergingMoves.push(nextMove);
								}
							}
							moveCommutingSubsequence = [...nonMergingMoves, ...moveCommutingSubsequence];
							nonMergingMoves = [];
							moveSequenceArrayOutput.push(lastMove);
						}
					} else { // move is alone in commuting group, it should simply be added
						moveSequenceArrayOutput.push(lastMove);
					}
				}
			}
			parsedMoveSequence = moveSequenceArrayOutput.slice(0); // copy moveSequenceArrayOutput into parsedMoveSequence
		} while (shouldRecomputeAfter);
		let moveArrayOutput = [];
		for (let moveObject of moveSequenceArrayOutput) {
			moveArrayOutput.push(buildMoveStringFromObject(moveObject));
		}
		return moveArrayOutput;
	}
};

const tryToMergeTwoMoves = (lastMove, nextMove, puzzle) => {
	let lastMoveParsed = getTurnSliceNumbersAndTurnAngle(lastMove, puzzle);
	let nextMoveParsed = getTurnSliceNumbersAndTurnAngle(nextMove, puzzle);
	let fusionResult = computeFusionResult(lastMoveParsed, nextMoveParsed);
	fusionResult.familyGroup = lastMove.familyGroup;
	return buildOutputMovesFromFusionResult(fusionResult, puzzle);
};

const computeFusionResult = (lastMoveParsed, nextMoveParsed) => {
	let fusionResult = {minSliceNumber: 0, maxSliceNumber: 0, turnAngle: 0, hasMerged : false, hasCancelled: false};
	if (lastMoveParsed.minSliceNumber === nextMoveParsed.minSliceNumber && lastMoveParsed.maxSliceNumber === nextMoveParsed.maxSliceNumber) { // same slice or block of slices : move merge or cancel
		let combinedTurnAngle = lastMoveParsed.turnAngle + nextMoveParsed.turnAngle;
		if (combinedTurnAngle % 4 === 0) { // moves perfectly cancel
			fusionResult.hasCancelled = true;
		} else { // normal fusion
			fusionResult.minSliceNumber = lastMoveParsed.minSliceNumber;
			fusionResult.maxSliceNumber = lastMoveParsed.maxSliceNumber;
			fusionResult.turnAngle = combinedTurnAngle;
			fusionResult.hasMerged = true;
		}
	} else { // other cases
		if (lastMoveParsed.turnAngle === nextMoveParsed.turnAngle) { // same turn angle
			if (lastMoveParsed.maxSliceNumber + 1 === nextMoveParsed.minSliceNumber) { // moves of the form R M'
				fusionResult.minSliceNumber = lastMoveParsed.minSliceNumber;
				fusionResult.maxSliceNumber = nextMoveParsed.maxSliceNumber;
				fusionResult.turnAngle = lastMoveParsed.turnAngle;
				fusionResult.hasMerged = true;
			} else if (lastMoveParsed.minSliceNumber === nextMoveParsed.maxSliceNumber + 1) { // moves of the form M' R
				fusionResult.minSliceNumber = nextMoveParsed.minSliceNumber;
				fusionResult.maxSliceNumber = lastMoveParsed.maxSliceNumber;
				fusionResult.turnAngle = lastMoveParsed.turnAngle;
				fusionResult.hasMerged = true;
			} // else no possible fusion
		}
		if ((lastMoveParsed.turnAngle + nextMoveParsed.turnAngle) % 4 === 0 && !fusionResult.hasMerged) { // opposite turn angle
			if (lastMoveParsed.minSliceNumber === nextMoveParsed.minSliceNumber) {
				if (lastMoveParsed.maxSliceNumber < nextMoveParsed.maxSliceNumber) { // moves of the form r R'
					fusionResult.minSliceNumber = lastMoveParsed.maxSliceNumber + 1;
					fusionResult.maxSliceNumber = nextMoveParsed.maxSliceNumber;
					fusionResult.turnAngle = nextMoveParsed.turnAngle;
					fusionResult.hasMerged = true;
				} else { // lastMoveParsed.maxSliceNumber > nextMoveParsed.maxSliceNumber, moves of the form R r'
					fusionResult.minSliceNumber = nextMoveParsed.maxSliceNumber + 1;
					fusionResult.maxSliceNumber = lastMoveParsed.maxSliceNumber;
					fusionResult.turnAngle = lastMoveParsed.turnAngle;
					fusionResult.hasMerged = true;
				} // no possible else
			} else if (lastMoveParsed.maxSliceNumber === nextMoveParsed.maxSliceNumber) {
				if (lastMoveParsed.minSliceNumber < nextMoveParsed.minSliceNumber) { // moves of the form r M
					fusionResult.minSliceNumber = lastMoveParsed.minSliceNumber;
					fusionResult.maxSliceNumber = nextMoveParsed.minSliceNumber - 1;
					fusionResult.turnAngle = lastMoveParsed.turnAngle;
					fusionResult.hasMerged = true;
				} else { // lastMoveParsed.minSliceNumber > nextMoveParsed.minSliceNumber, moves of the form M r
					fusionResult.minSliceNumber = nextMoveParsed.minSliceNumber;
					fusionResult.maxSliceNumber = lastMoveParsed.minSliceNumber - 1;
					fusionResult.turnAngle = nextMoveParsed.turnAngle;
					fusionResult.hasMerged = true;
				}
			} // else no possible fusion
		}
	}
	return fusionResult;
};

const buildOutputMovesFromFusionResult = (fusionResult, puzzle) => {
	let result = {
		moves: [],
		hasMerged: fusionResult.hasMerged,
		hasCancelled: fusionResult.hasCancelled
	};
	if (fusionResult.hasMerged && !fusionResult.hasCancelled) { // if something has been merged, build resulting moves with fusionResult
		let moveResult = {
			familyGroup: fusionResult.familyGroup
		};
		if (fusionResult.minSliceNumber === 1) { // outer block from reference face
			let suffix = getSuffixFromTurnAngle(fusionResult.turnAngle);
			if (fusionResult.maxSliceNumber === puzzle) { // rotation
				moveResult.prefix = "";
				moveResult.family = fusionResult.familyGroup[7];
				moveResult.suffix = suffix;
			} else if (fusionResult.maxSliceNumber === 1) { // single outer slice
				moveResult.prefix = "";
				moveResult.family = fusionResult.familyGroup[2];
				moveResult.suffix = suffix;
			} else if (fusionResult.maxSliceNumber === 2) { // double outer slice
				moveResult.prefix = "";
				if (puzzle === 3) {
					moveResult.family = fusionResult.familyGroup[4];
					moveResult.suffix = suffix;
				} else {
					moveResult.family = fusionResult.familyGroup[2];
					moveResult.suffix = "w" + suffix;
				}
			} else { // any other outer block
				moveResult.prefix = fusionResult.maxSliceNumber + "";
				moveResult.family = fusionResult.familyGroup[2];
				moveResult.suffix = "w" + suffix;
			}
		} else if (fusionResult.maxSliceNumber === puzzle) { // outer block from opposite of reference face
			let suffix = getSuffixFromOppositeTurnAngle(fusionResult.turnAngle);
			if (fusionResult.minSliceNumber === puzzle) { // single outer slice
				moveResult.prefix = "";
				moveResult.family = fusionResult.familyGroup[3];
				moveResult.suffix = suffix;
			} else if (fusionResult.minSliceNumber === puzzle - 1) { // double outer slice
				moveResult.prefix = "";
				if (puzzle === 3) {
					moveResult.family = fusionResult.familyGroup[5];
					moveResult.suffix = suffix;
				} else {
					moveResult.family = fusionResult.familyGroup[3];
					moveResult.suffix = "w" + suffix;
				}
			} else { // any other outer block
				moveResult.prefix = puzzle + 1 - fusionResult.minSliceNumber + "";
				moveResult.family = fusionResult.familyGroup[3];
				moveResult.suffix = "w" + suffix;
			}
		} else { // inner slice move
			if (fusionResult.minSliceNumber === fusionResult.maxSliceNumber) { // single inner slice
				if (fusionResult.minSliceNumber === (puzzle + 1)/2) { // middle layer
					moveResult.prefix = "";
					moveResult.family = fusionResult.familyGroup[6];
					if (fusionResult.familyGroup === "/[FBfbSz]/g") {
						moveResult.suffix = getSuffixFromTurnAngle(fusionResult.turnAngle);
					} else {
						moveResult.suffix = getSuffixFromOppositeTurnAngle(fusionResult.turnAngle);
					}
				} else if (puzzle - fusionResult.maxSliceNumber < fusionResult.minSliceNumber - 1) { // inner block, nearer from opposite of reference face
					moveResult.prefix = puzzle + 1 - fusionResult.minSliceNumber + "";
					moveResult.family = fusionResult.familyGroup[4];
					moveResult.suffix = getSuffixFromOppositeTurnAngle(fusionResult.turnAngle);
				} else { // nearer from reference face, or equal in distance
					moveResult.prefix = fusionResult.minSliceNumber;
					moveResult.family = fusionResult.familyGroup[2];
					moveResult.suffix = getSuffixFromTurnAngle(fusionResult.turnAngle);
				}
			} else { // many inner slices
				if (puzzle - fusionResult.maxSliceNumber < fusionResult.minSliceNumber - 1) { // inner block, nearer from opposite of reference face
					moveResult.prefix = (puzzle + 1 - fusionResult.maxSliceNumber) + "-" + (puzzle + 1 - fusionResult.minSliceNumber);
					moveResult.family = fusionResult.familyGroup[4];
					moveResult.suffix = "w" + getSuffixFromOppositeTurnAngle(fusionResult.turnAngle);
				} else { // nearer from reference face, or equal in distance
					moveResult.prefix = fusionResult.minSliceNumber + "-" + fusionResult.maxSliceNumber;
					moveResult.family = fusionResult.familyGroup[2];
					moveResult.suffix = "w" + getSuffixFromTurnAngle(fusionResult.turnAngle);
				}
			}
		}
		result.moves.push(moveResult);
	} // if no merge or perfect cancellation, nothing to add
	return result;
};

const buildMoveStringFromObject = moveObject => {
	return moveObject.prefix + moveObject.family + (moveObject.suffix === "1" ? "" : moveObject.suffix);
};

const getLastElementOfArray = array => {
	return array.slice(-1)[0];
};

module.exports = {mergeMoves};
