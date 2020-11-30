"use strict";

// sequence parsing, first level

const getMoveObjectSequenceFromMoveStringSequence = moveStringSequence => {
	let moveObjectSequence = [];
	let familyGroupFromFamily = {
		R: "RLrlMx", L: "RLrlMx", r: "RLrlMx", l: "RLrlMx", M: "RLrlMx", x: "RLrlMx",
		U: "UDudEy", D: "UDudEy", u: "UDudEy", d: "UDudEy", E: "UDudEy", y: "UDudEy",
		F: "FBfbSz", B: "FBfbSz", f: "FBfbSz", b: "FBfbSz", S: "FBfbSz", z: "FBfbSz"
	};
	for (let moveString of moveStringSequence) {
		let family = moveString.match(movePattern)[0];
		moveObjectSequence.push({
			name: moveString,
			family: family,
			familyGroup: familyGroupFromFamily[family]
		});
	}
	return moveObjectSequence;
};

const getCommutingGroups = moveObjectSequence => {
	if (moveObjectSequence.length === 0) {
		return [];
	} else {
		let commutingGroups = [[moveObjectSequence[0]]];
		let lastFamilyGroup = moveObjectSequence[0].familyGroup;
		for (let moveObject of moveObjectSequence.slice(1)) {
			if (moveObject.familyGroup !== lastFamilyGroup) {
				commutingGroups.push([moveObject]); // start new commutingGroup
				lastFamilyGroup = moveObject.familyGroup;
			} else {
				commutingGroups.slice(-1)[0].push(moveObject); // push move to last commutingGroup
			}
		}
		return commutingGroups;
	}
};

// sequence parsing, second level

const movePattern = /[RUFLDBrufldbMESxyz]/g;

const isMiddleMove = {
	M: true,
	E: true,
	S: true
};

const isRotationMove = {
	x: true,
	y: true,
	z: true
};

const isLowerLetter = {
	r: true,
	u: true,
	f: true,
	l: true,
	d: true,
	b: true
};

const isFromReferenceFace = {
	R: true,
	r: true,
	U: true,
	u: true,
	F: true,
	f: true,
	S: true
};

const parseMovesForMerging = (moveObjectSequence, puzzle) => {
	for (let moveObject of moveObjectSequence) {
		if (!moveObject.turnAngle) { // if move has already been parsed, no need to parse it again
			parseOneMoveForMerging(moveObject, puzzle);
			if (!isFromReferenceFace[moveObject.family]) { // if move is opposite from reference, move has to be adapted
				moveObject.turnAngle = -moveObject.turnAngle; // invert rotation sense
				Object.assign(moveObject, { // take complement values + swap min and max
					minSliceNumber: puzzle + 1 - moveObject.maxSliceNumber,
					maxSliceNumber: puzzle + 1 - moveObject.minSliceNumber
				});
			}
		}
	}
};

const parseOneMoveForMerging = (moveObject, puzzle) => {
	let splitsByMoveFamily = moveObject.name.split(movePattern);
	moveObject.turnAngle = parseSuffixForMerging(splitsByMoveFamily[1].replace("w" ,""));
	if (isMiddleMove[moveObject.family]) { // move of the form M2
		moveObject.minSliceNumber = (puzzle + 1)/2;
		moveObject.maxSliceNumber = (puzzle + 1)/2;
	} else if (isRotationMove[moveObject.family]) { // move of the form x2
		moveObject.minSliceNumber = 1;
		moveObject.maxSliceNumber = puzzle;
	} else if (splitsByMoveFamily[0] === "") { // move of the form R2, Rw2 or r2
		if (isLowerLetter[moveObject.family] && puzzle !== 3) { // r2 on 4x4+
			moveObject.minSliceNumber = 2;
		} else { // r2 on 3x3, R2 and Rw2
			moveObject.minSliceNumber = 1;
		}
		if (isLowerLetter[moveObject.family] || splitsByMoveFamily[1].includes("w")) { // r2 or Rw2
			moveObject.maxSliceNumber = 2;
		} else { // R2
			moveObject.maxSliceNumber = 1;
		}
	} else if (splitsByMoveFamily[0].length === 1) { // move of the form 2R2, 2Rw2 or 2r2
		let prefixNumber = parseInt(splitsByMoveFamily[0]);
		if (splitsByMoveFamily[1].includes("w")) { // 2Rw2
			moveObject.minSliceNumber = 1;
		} else { // 2R2 or 2r2
			moveObject.minSliceNumber = prefixNumber;
		}
		moveObject.maxSliceNumber = prefixNumber; // = prefix digit for 2Rw2, 2R2 and 2r2
	} else { // move of the form 2-3Rw2 or 2-3R2
		if (splitsByMoveFamily[0][0] < splitsByMoveFamily[0][2]) {
			moveObject.minSliceNumber = parseInt(splitsByMoveFamily[0][0]);
			moveObject.maxSliceNumber = parseInt(splitsByMoveFamily[0][2]);
		} else {
			moveObject.minSliceNumber = parseInt(splitsByMoveFamily[0][2]);
			moveObject.maxSliceNumber = parseInt(splitsByMoveFamily[0][0]);
		}
	}
};

const parseSuffixForMerging = suffix => {
	suffix = suffix.replace("w", "");
	if (suffix === "") {
		return 1;
	} else if (suffix === "'") {
		return -1;
	} else if (suffix.includes("'")) {
		return -parseInt(suffix.slice(0, -1));
	} else {
		return parseInt(suffix);
	}
};

// sequence recomposition

const getSuffixFromTurnAngleModulo = {
	0: "",
	1: "",
	2: "2",
	3: "'",
	"-1": "'",
	"-2": "2",
	"-3": ""
};

const buildOutputSequenceFromMergedCommutingGroups = (commutingGroups, puzzle) => {
	let moveStringSequence = [];
	for (let commutingGroup of commutingGroups) {
		for (let moveObject of commutingGroup) {
			if (moveObject.name) { // move has its original name, it hasn't been merged, keep it
				moveStringSequence.push(moveObject.name);
			} else { // rebuild move name from object
				if (moveObject.minSliceNumber === 1) { // outer block from reference face
					if (moveObject.maxSliceNumber === puzzle) { // rotation
						moveStringSequence.push(moveObject.familyGroup[5] + getSuffixFromTurnAngle(moveObject.turnAngle));
					} else if (moveObject.maxSliceNumber === 1) { // single outer slice
						moveStringSequence.push(moveObject.familyGroup[0] + getSuffixFromTurnAngle(moveObject.turnAngle));
					} else if (moveObject.maxSliceNumber === 2) { // double outer slice
						if (puzzle === 3) {
							moveStringSequence.push(moveObject.familyGroup[2] + getSuffixFromTurnAngle(moveObject.turnAngle));
						} else {
							moveStringSequence.push(moveObject.familyGroup[0] + "w" + getSuffixFromTurnAngle(moveObject.turnAngle));
						}
					} else { // any other outer block
						moveStringSequence.push(moveObject.maxSliceNumber + moveObject.familyGroup[0] + "w" + getSuffixFromTurnAngle(moveObject.turnAngle));
					}
				} else if (moveObject.maxSliceNumber === puzzle) { // outer block from opposite of reference face
					if (moveObject.minSliceNumber === puzzle) { // single outer slice
						moveStringSequence.push(moveObject.familyGroup[1] + getSuffixFromTurnAngle(-moveObject.turnAngle));
					} else if (moveObject.minSliceNumber === puzzle - 1) { // double outer slice
						if (puzzle === 3) {
							moveStringSequence.push(moveObject.familyGroup[3] + getSuffixFromTurnAngle(-moveObject.turnAngle));
						} else {
							moveStringSequence.push(moveObject.familyGroup[1] + "w" + getSuffixFromTurnAngle(-moveObject.turnAngle));
						}
					} else { // any other outer block
						moveStringSequence.push(puzzle + 1 - moveObject.minSliceNumber + moveObject.familyGroup[1] + "w" + getSuffixFromTurnAngle(-moveObject.turnAngle));
					}
				} else { // inner slice move
					if (moveObject.minSliceNumber === moveObject.maxSliceNumber) { // single inner slice
						if (moveObject.minSliceNumber === (puzzle + 1)/2) { // middle layer
							moveStringSequence.push(moveObject.familyGroup[4] + getSuffixFromTurnAngle(moveObject.familyGroup[4] === "S" ? moveObject.turnAngle : -moveObject.turnAngle));
						} else if (puzzle - moveObject.minSliceNumber < moveObject.minSliceNumber - 1) { // inner slice, nearer the opposite of reference face
							moveStringSequence.push(puzzle + 1 - moveObject.minSliceNumber + moveObject.familyGroup[1] + getSuffixFromTurnAngle(-moveObject.turnAngle));
						} else { // inner slice, nearer the reference face or equal in distance
							moveStringSequence.push(moveObject.minSliceNumber + moveObject.familyGroup[0] + getSuffixFromTurnAngle(moveObject.turnAngle));
						}
					} else { // many inner slices
						if (puzzle - moveObject.maxSliceNumber < moveObject.minSliceNumber - 1) { // inner block, nearer the opposite of reference face
							moveStringSequence.push(puzzle + 1 - moveObject.maxSliceNumber + "-" + (puzzle + 1 - moveObject.minSliceNumber) + moveObject.familyGroup[1] + "w" + getSuffixFromTurnAngle(-moveObject.turnAngle));
						} else { // inner block, nearer the reference face or equal in distance
							moveStringSequence.push(moveObject.minSliceNumber + "-" + moveObject.maxSliceNumber + moveObject.familyGroup[0] + "w" + getSuffixFromTurnAngle(moveObject.turnAngle));
						}
					}
				}
			}
		}
	}
	return moveStringSequence;
};

const getSuffixFromTurnAngle = turnAngle => {
	return getSuffixFromTurnAngleModulo[turnAngle % 4];
};

// sequence merging

const mergeMoves = (moveStringSequence, puzzle) => {
	let commutingGroups = getCommutingGroups(getMoveObjectSequenceFromMoveStringSequence(moveStringSequence));
	for (let commutingGroup of commutingGroups) {
		tryToMergeMovesInCommutingGroup(commutingGroup, puzzle);
	}
	for (let commutingGroupIndex = 0; commutingGroupIndex < commutingGroups.length; commutingGroupIndex++) {
		if (commutingGroups[commutingGroupIndex].length === 0) { // group has entirely cancelled, try to merge previous and next group
			commutingGroupIndex = mergePreviousAndNextGroups(commutingGroups, commutingGroupIndex, puzzle);
		}
	}
	return buildOutputSequenceFromMergedCommutingGroups(commutingGroups, puzzle);
};

const tryToMergeMovesInCommutingGroup = (commutingGroup, puzzle) => {
	if (commutingGroup.length !== 1) { // if group is too small, no possible merge
		parseMovesForMerging(commutingGroup, puzzle);
		for (let lastMoveIndex = 0; lastMoveIndex < commutingGroup.length; lastMoveIndex++) {
			let lastMove = commutingGroup[lastMoveIndex];
			for (let nextMoveIndex = lastMoveIndex + 1; nextMoveIndex < commutingGroup.length; nextMoveIndex++) {
				let nextMove = commutingGroup[nextMoveIndex];
				let fusionResult = computeFusionResult(lastMove, nextMove);
				if (fusionResult.hasCancelled) { // perfect cancellation
					commutingGroup.splice(nextMoveIndex, 1); // remove nextMove
					commutingGroup.splice(lastMoveIndex, 1); // remove lastMove
					lastMoveIndex--; // next lastMove will be at the same index as the current one
					break; // stop trying to merge this move, because it has been cancelled, we can't do better
				} else if (fusionResult.hasMerged) { // normal fusion
					commutingGroup.splice(nextMoveIndex, 1); // remove nextMove
					lastMove = fusionResult; // update lastMove
					commutingGroup[lastMoveIndex] = lastMove; // update lastMove in array
				} // else no merge, simply ignore
			}
		}
	}
};

const computeFusionResult = (lastMove, nextMove) => {
	if (lastMove.minSliceNumber === nextMove.minSliceNumber && lastMove.maxSliceNumber === nextMove.maxSliceNumber) { // same slice or block of slices : move merge or cancel
		let combinedTurnAngle = lastMove.turnAngle + nextMove.turnAngle;
		if (combinedTurnAngle % 4 === 0) { // moves perfectly cancel
			return {
				hasCancelled: true
			};
		} else { // normal fusion
			return {
				minSliceNumber: lastMove.minSliceNumber,
				maxSliceNumber: lastMove.maxSliceNumber,
				turnAngle: combinedTurnAngle,
				familyGroup: lastMove.familyGroup,
				hasMerged: true
			};
		}
	} else { // other cases
		if (lastMove.turnAngle === nextMove.turnAngle) { // same turn angle
			if (lastMove.maxSliceNumber + 1 === nextMove.minSliceNumber) { // moves of the form R M'
				return {
					minSliceNumber: lastMove.minSliceNumber,
					maxSliceNumber: nextMove.maxSliceNumber,
					turnAngle: lastMove.turnAngle,
					familyGroup: lastMove.familyGroup,
					hasMerged: true
				};
			} else if (lastMove.minSliceNumber === nextMove.maxSliceNumber + 1) { // moves of the form M' R
				return {
					minSliceNumber: nextMove.minSliceNumber,
					maxSliceNumber: lastMove.maxSliceNumber,
					turnAngle: lastMove.turnAngle,
					familyGroup: lastMove.familyGroup,
					hasMerged: true
				};
			} // else no possible fusion
		}
		if ((lastMove.turnAngle + nextMove.turnAngle) % 4 === 0) { // opposite turn angle
			if (lastMove.minSliceNumber === nextMove.minSliceNumber) {
				if (lastMove.maxSliceNumber < nextMove.maxSliceNumber) { // moves of the form r R'
					return {
						minSliceNumber: lastMove.maxSliceNumber + 1,
						maxSliceNumber: nextMove.maxSliceNumber,
						turnAngle: nextMove.turnAngle,
						familyGroup: lastMove.familyGroup,
						hasMerged: true
					};
				} else { // lastMoveParsed.maxSliceNumber > nextMoveParsed.maxSliceNumber, moves of the form R r'
					return {
						minSliceNumber: nextMove.maxSliceNumber + 1,
						maxSliceNumber: lastMove.maxSliceNumber,
						turnAngle: lastMove.turnAngle,
						familyGroup: lastMove.familyGroup,
						hasMerged: true
					};
				} // no possible else
			} else if (lastMove.maxSliceNumber === nextMove.maxSliceNumber) {
				if (lastMove.minSliceNumber < nextMove.minSliceNumber) { // moves of the form r M
					return {
						minSliceNumber: lastMove.minSliceNumber,
						maxSliceNumber: nextMove.minSliceNumber - 1,
						turnAngle: lastMove.turnAngle,
						familyGroup: lastMove.familyGroup,
						hasMerged: true
					};
				} else { // lastMoveParsed.minSliceNumber > nextMoveParsed.minSliceNumber, moves of the form M r
					return {
						minSliceNumber: nextMove.minSliceNumber,
						maxSliceNumber: lastMove.minSliceNumber - 1,
						turnAngle: nextMove.turnAngle,
						familyGroup: lastMove.familyGroup,
						hasMerged: true
					};
				}
			} // else no possible fusion
		}
	}
	return {
		hasMerged: false,
		hasCancelled: false
	};
};

const mergePreviousAndNextGroups = (commutingGroups, commutingGroupIndex, puzzle) => {
	if (commutingGroupIndex === 0) { // if first commuting group, there is no group before
		commutingGroups.splice(0, 1); // remove current empty group
		return -1;
	} else {
		let lastGroupIndex = commutingGroupIndex - 1; // as we go through commuting groups and stop at first empty group, the previous one is always non-empty
		let lastGroup = commutingGroups[lastGroupIndex];
		let nextGroupIndex, nextGroup;
		findNextNonEmptyGroup: {
			for (nextGroupIndex = commutingGroupIndex + 1; nextGroupIndex < commutingGroups.length; nextGroupIndex++) {
				if (commutingGroups[nextGroupIndex].length !== 0) { // found next non-empty group
					nextGroup = commutingGroups[nextGroupIndex];
					break findNextNonEmptyGroup;
				}
			}
			commutingGroups.splice(commutingGroupIndex); // remove empty group and all next groups because they are empty
			return lastGroupIndex;
		}
		if (lastGroup[0].familyGroup === nextGroup[0].familyGroup) { // last and next non-empty groups have the same familyGroup, they can be merged
			lastGroup.push(...nextGroup);
			commutingGroups.splice(commutingGroupIndex, nextGroupIndex - lastGroupIndex); // remove empty groups and next non-empty group
			tryToMergeMovesInCommutingGroup(commutingGroups[lastGroupIndex], puzzle);
			if (commutingGroups[lastGroupIndex].length === 0) { // group has completely cancelled
				return mergePreviousAndNextGroups(commutingGroups, lastGroupIndex, puzzle); // recursively try to merge groups
			} else { // simply return
				return lastGroupIndex;
			}
		} else { // groups can't be merged
			commutingGroups.splice(commutingGroupIndex, nextGroupIndex - commutingGroupIndex); // remove empty groups
			return lastGroupIndex;
		}
	}
};

module.exports = {mergeMoves};
