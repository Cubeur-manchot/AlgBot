"use strict";

const movePattern = /[RUFLDBrufldbMESxyz]/g;

const suffixFromTurnAngleModulo = {
	0: "",
	1: "",
	2: "2",
	3: "'",
	"-1": "'",
	"-2": "2",
	"-3": ""
};

const getMoveObjectSequenceFromMoveStringSequence = moveStringSequence => {
	let moveObjectSequence = [];
	let familyGroupFromFamily = {
		R: "/[RLrlMx]/g", L: "/[RLrlMx]/g", r: "/[RLrlMx]/g", l: "/[RLrlMx]/g", M: "/[RLrlMx]/g", x: "/[RLrlMx]/g",
		U: "/[UDudEy]/g", D: "/[UDudEy]/g", u: "/[UDudEy]/g", d: "/[UDudEy]/g", E: "/[UDudEy]/g", y: "/[UDudEy]/g",
		F: "/[FBfbSz]/g", B: "/[FBfbSz]/g", f: "/[FBfbSz]/g", b: "/[FBfbSz]/g", S: "/[FBfbSz]/g", z: "/[FBfbSz]/g"
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
	let commutingGroups = [];
	let lastFamilyGroup = "";
	for (let moveObject of moveObjectSequence) {
		if (commutingGroups.length === 0 || moveObject.familyGroup !== lastFamilyGroup) {
			commutingGroups.push([moveObject]); // start new commutingGroup
			lastFamilyGroup = moveObject.familyGroup;
		} else {
			commutingGroups.slice(-1)[0].push(moveObject); // push move to last commutingGroup
		}
	}
	return commutingGroups;
};

const parseSuffixForMerging = suffix => {
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

const parsePrefixAndFamilyForMerging = (prefix, family, puzzle) => {
	if (/[MES]/.test(family)) { // move of the form M2
		return {
			minSliceNumber: (puzzle + 1)/2,
			maxSliceNumber: (puzzle + 1)/2
		};
	} else if (/[xyz]/.test(family)) { // move of the form x2
		return {
			minSliceNumber: 1,
			maxSliceNumber: puzzle
		};
	} else if (prefix === "") { // move of the form R2, Rw2 or r2
		let isSmallLetter = /[rufldb]/.test(family);
		return {
			minSliceNumber: 1 + (isSmallLetter && puzzle !== 3), // = 2 for r2 on 4x4+, = 1 for r2 on 3x3, R2 and Rw2
			maxSliceNumber: 1 + (isSmallLetter || family.includes("w")) // = 1 for R2, 2 for Rw2 and r2
		};
	} else if (prefix.length === 1) { // move of the form 2R2, 2Rw2 or 2r2
		return {
			minSliceNumber: family.includes("w") ? 1 : +prefix, // = 1 for 2Rw2, = digit for 2R2 and 2r2
			maxSliceNumber: +prefix // = digit for 2Rw2, 2R2 and 2r2
		};
	} else { // move of the form 2-3Rw2 or 2-3R2
		return {
			minSliceNumber: Math.min(+prefix[0], +prefix[2]),
			maxSliceNumber: Math.max(+prefix[0], +prefix[2])
		}
	}
};

const parseMovesForMerging = (moveObjectSequence, puzzle) => {
	for (let moveObject of moveObjectSequence) {
		if (!moveObject.turnAngle) { // if move has already been parsed, no need to parse it again
			let splitsByMoveFamily = moveObject.name.split(movePattern);
			let prefix = splitsByMoveFamily[0];
			let suffix = (splitsByMoveFamily[1] === "" ? "1" : splitsByMoveFamily[1].replace("w", ""));
			moveObject.turnAngle = parseSuffixForMerging(suffix); // parse suffix for turn angle
			Object.assign(moveObject, parsePrefixAndFamilyForMerging(prefix, moveObject.family, puzzle)); // parse prefix and family for slice numbers
			if (/[LlDdBbM]/g.test(moveObject.family)) { // if move is opposite from reference, move has to be adapted
				moveObject.turnAngle = -moveObject.turnAngle;
				moveObject.minSliceNumber = puzzle + 1 - moveObject.minSliceNumber; // complement to puzzle
				moveObject.maxSliceNumber = puzzle + 1 - moveObject.maxSliceNumber; // complement to puzzle
			}
		}
	}
};

const tryToMergeMovesInCommutingGroup = (commutingGroup, puzzle) => {
	if (commutingGroup.length === 1) { // group is too small, no possible merge
		return commutingGroup;
	} else {
		parseMovesForMerging(commutingGroup, puzzle);
		for (let lastMoveIndex = 0; lastMoveIndex < commutingGroup.length; lastMoveIndex++) {
			let lastMove = commutingGroup[lastMoveIndex];
			for (let nextMoveIndex = lastMoveIndex + 1; nextMoveIndex < commutingGroup.length; nextMoveIndex++) {
				let nextMove = commutingGroup[nextMoveIndex];
				let fusionResult = computeFusionResult(lastMove, nextMove);
				if (fusionResult.hasCancelled) { // perfect cancellation
					commutingGroup.splice(nextMoveIndex, 1); // remove nextMove
					commutingGroup.splice(lastMoveIndex, 1); // remove lastMove
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

const mergePreviousAndNextGroups = (commutingGroups, commutingGroupIndex, puzzle) => {
	let lastGroupIndex, lastGroup, nextGroupIndex, nextGroup;
	if (commutingGroupIndex === 0) {
		commutingGroups.splice(0, 1);
		return 0;
	} else {
		lastGroupIndex = commutingGroupIndex - 1;
		lastGroup = commutingGroups[lastGroupIndex];
	}
	findNextNonEmptyGroup: {
		for (nextGroupIndex = commutingGroupIndex + 1; nextGroupIndex < commutingGroups.length; nextGroupIndex++) {
			if (commutingGroups[nextGroupIndex].length !== 0) {
				nextGroup = commutingGroups[nextGroupIndex];
				break findNextNonEmptyGroup;
			}
		}
		return commutingGroupIndex;
	}
	if (lastGroup[0].familyGroup === nextGroup[0].familyGroup) { // groups can be merged
		lastGroup.push(...nextGroup);
		commutingGroups.splice(lastGroupIndex + 1, nextGroupIndex - lastGroupIndex); // remove empty groups
		tryToMergeMovesInCommutingGroup(commutingGroups[lastGroupIndex], puzzle);
		if (commutingGroups[lastGroupIndex].length === 0) { // group has completely cancelled
			let lastNonEmptyGroup = mergePreviousAndNextGroups(commutingGroups, lastGroupIndex, puzzle);
			return lastNonEmptyGroup;
		} else {
			return lastGroupIndex;
		}
	} else { // groups can't be merged
		commutingGroups.splice(lastGroupIndex + 1, nextGroupIndex - 1 - lastGroupIndex); // remove empty groups
		return lastGroupIndex;
	}
};

const buildOutputSequenceFromMergedCommutingGroups = (commutingGroups, puzzle) => {
	let moveStringSequence = [];
	for (let commutingGroup of commutingGroups) {
		for (let moveObject of commutingGroup) {
			if (moveObject.name) { // move has its original name, it hasn't been merged, keep it
				moveStringSequence.push(moveObject.name);
			} else { // rebuild move name from object
				if (moveObject.minSliceNumber === 1) { // outer block from reference face
					let suffix = getSuffixFromTurnAngle(moveObject.turnAngle);
					if (moveObject.maxSliceNumber === puzzle) { // rotation
						moveStringSequence.push(moveObject.familyGroup[7] + suffix);
					} else if (moveObject.maxSliceNumber === 1) { // single outer slice
						moveStringSequence.push(moveObject.familyGroup[2] + suffix);
					} else if (moveObject.maxSliceNumber === 2) { // double outer slice
						if (puzzle === 3) {
							moveStringSequence.push(moveObject.familyGroup[4] + suffix);
						} else {
							moveStringSequence.push(moveObject.familyGroup[2] + "w" + suffix);
						}
					} else { // any other outer block
						moveStringSequence.push(moveObject.maxSliceNumber + moveObject.familyGroup[2] + "w" + suffix);
					}
				} else if (moveObject.maxSliceNumber === puzzle) { // outer block from opposite of reference face
					let suffix = getSuffixFromTurnAngle(-moveObject.turnAngle);
					if (moveObject.minSliceNumber === puzzle) { // single outer slice
						moveStringSequence.push(moveObject.familyGroup[3] + suffix);
					} else if (moveObject.minSliceNumber === puzzle - 1) { // double outer slice
						if (puzzle === 3) {
							moveStringSequence.push(moveObject.familyGroup[5] + suffix);
						} else {
							moveStringSequence.push(moveObject.familyGroup[3] + "w" + suffix);
						}
					} else { // any other outer block
						moveStringSequence.push(puzzle + 1 - moveObject.minSliceNumber + moveObject.familyGroup[3] + "w" + suffix);
					}
				} else { // inner slice move
					if (moveObject.minSliceNumber === moveObject.maxSliceNumber) { // single inner slice
						if (moveObject.minSliceNumber === (puzzle + 1)/2) { // middle layer
							moveStringSequence.push(moveObject.familyGroup[6] + getSuffixFromTurnAngle(moveObject.familyGroup[6] === "S" ? moveObject.turnAngle : -moveObject.turnAngle));
						} else if (puzzle - moveObject.minSliceNumber < moveObject.minSliceNumber - 1) { // inner slice, nearer the opposite of reference face
							moveStringSequence.push(puzzle + 1 - moveObject.minSliceNumber + moveObject.familyGroup[4] + getSuffixFromTurnAngle(-moveObject.turnAngle));
						} else { // inner slice, nearer the reference face or equal in distance
							moveStringSequence.push(moveObject.minSliceNumber + moveObject.familyGroup[2] + getSuffixFromTurnAngle(moveObject.turnAngle));
						}
					} else { // many inner slices
						if (puzzle - moveObject.maxSliceNumber < moveObject.minSliceNumber - 1) { // inner block, nearer the opposite of reference face
							moveStringSequence.push(puzzle + 1 - moveObject.maxSliceNumber + "-" + (puzzle + 1 - moveObject.minSliceNumber) + moveObject.familyGroup[4] + "w" + getSuffixFromTurnAngle(-moveObject.turnAngle));
						} else { // inner block, nearer the reference face or equal in distance
							moveStringSequence.push(moveObject.minSliceNumber + "-" + moveObject.maxSliceNumber + moveObject.familyGroup[2] + "w" + getSuffixFromTurnAngle(moveObject.turnAngle));
						}
					}
				}
			}
		}
	}
	return moveStringSequence;
};

const mergeMoves = (moveStringSequence, puzzle) => {
	let moveObjectSequence = getMoveObjectSequenceFromMoveStringSequence(moveStringSequence);
	let commutingGroups = getCommutingGroups(moveObjectSequence);
	for (let commutingGroup of commutingGroups) {
		tryToMergeMovesInCommutingGroup(commutingGroup, puzzle);
	}
	for (let commutingGroupIndex = 0; commutingGroupIndex < commutingGroups.length; commutingGroupIndex++) {
		if (commutingGroups[commutingGroupIndex].length === 0) { // group has entirely cancelled, try to merge previous and next group
			let lastNonEmptyGroup = mergePreviousAndNextGroups(commutingGroups, commutingGroupIndex, puzzle);
			commutingGroupIndex = lastNonEmptyGroup;
		}
	}
	return buildOutputSequenceFromMergedCommutingGroups(commutingGroups, puzzle);
};

const computeFusionResult = (lastMoveParsed, nextMoveParsed) => {
	let fusionResult = {minSliceNumber: 0, maxSliceNumber: 0, turnAngle: 0, familyGroup: lastMoveParsed.familyGroup, hasMerged : false, hasCancelled: false};
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

const getSuffixFromTurnAngle = turnAngle => {
	return suffixFromTurnAngleModulo[turnAngle % 4];
};

module.exports = {mergeMoves};
