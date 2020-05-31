"use strict";

const algCollection = {
	PLLCollection: {
		pll_aa: "x R' U R' D2 R U' R' D2 R2 x'",
		pll_ab: "x R2' D2 R U R' D2 R U' R x'",
		pll_e: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
		pll_f: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
		pll_ga: "R2 u R' U R' U' R u' R2' F' U F",
		pll_gb: "F' U' F R2 u R' U R U' R u' R2'",
		pll_gc: "R2' u' R U' R U R' u R2 f R' f'",
		pll_gd: "f R f' R2' u' R U' R' U R' u R2",
		pll_h: "M2' U M2' U2 M2' U M2'",
		pll_ja: "R' U L' U2 R U' R' U2 R L",
		pll_jb: "R U R' F' R U R' U' R' F R2 U' R'",
		pll_j: "R U R' F' R U R' U' R' F R2 U' R'",
		pll_na: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
		pll_nb: "R' U L' U2 R U' L R' U L' U2 R U' L",
		pll_ra: "R U R' F' R U2 R' U2' R' F R U R U2' R'",
		pll_rb: "R' U2 R U2 R' F R U R' U' R' F' R2",
		pll_t: "R U R' U' R' F R2 U' R' U' R U R' F'",
		pll_ua: "R2 U' R' U' R U R U R U' R",
		pll_ub: "R' U R' U' R' U' R' U R U R2",
		pll_v: "R' U R' d' R' F' R2 U' R' U R' F R F",
		pll_y: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
		pll_z: "M2' U M2' U M' U2 M2' U2 M'"
	},
	basicAlgsCollection: {
		sune: "R U R' U R U2' R'",
		antisune: "R U2 R' U' R U' R'",
		leftsune: "L' U' L U' L' U2 L",
		leftantisune: "L' U2 L U L' U L",
		backsune: "R' U' R U' R' U2 R",
		backantisune: "R' U2 R U R' U R",
		leftbacksune: "L U L' U L U2 L'",
		leftbackantisune: "L U2 L' U' L U' L'",
		doublesune: "R U R' U R U' R' U R U2' R'",
		doubleantisune: "R U2 R' U' R U R' U' R U' R'",
		triplesune: "R U R' U R U' R' U R U' R' U R U2' R'",
		tripleantisune: "R U2 R' U' R U R' U' R U R' U' R U' R'",
		niklasdroite: "R U' L' U R' U' L",
		niklasgauche: "L' U R U' L U R'"
	},
	triggerCollection: {
		sledge: "R' F R F'",
		hedge: "F R' F' R",
		doublesledge: "R' F R F' R' F R F'",
		doublehedge: "F R' F' R F R' F' R",
		triplesledge: "R' F R F' R' F R F' R' F R F'",
		triplehedge: "F R' F' R F R' F' R F R' F' R",
		sexy: "R U R' U'",
		antisexy: "U R U' R'",
		doublesexy: "R U R' U' R U R' U'",
		doubleantisexy: "U R U' R' U R U' R'",
		triplesexy: "R U R' U' R U R' U' R U R' U'",
		tripleantisexy: "U R U' R' U R U' R' U R U' R'"
	},
	parity4x4x4Collection: {
		ollparity: "r U2 x r U2 r U2' r' U2 l U2 r' U2' r U2 r' U2' r'",
		pllparity: "Rw2 R2 U2 Rw2 R2 Uw2 Rw2 R2 Uw2",
		pllparitybigcubes: "Rw2' F2 U2 Rw2 R2' U2 F2 Rw2"
	}
};

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

const getAlgListHelpMessage = (message) => {
	return "Je peux insérer directement des algos enregistrés.\nLes algos enregistrés sont les suivants :\n"
		+ "\nToutes les PLL : `PLL_Aa`, `PLL_Ab`, `PLL_E`, `PLL_F`, `PLL_Ga`, `PLL_Gb`, `PLL_Gc`, `PLL_Gd`, `PLL_H`, `PLL_Ja`, `PLL_Jb`, "
		+ "`PLL_Na`, `PLL_Nb`, `PLL_Ra`, `PLL_Rb`, `PLL_T`, `PLL_Ua`, `PLL_Ub`, `PLL_V`, `PLL_Y`, `PLL_Z` :"
		+ "```parser3\n$alg R' PLL_Y R```"
		+ "\nLes sunes, antisunes et composés, les niklas :"
		+ "```parser3\n$alg tripleantisune niklasdroite```"
		+ `\nLes parités du <:4x4x4:693863938915565599> :`
		+ "```parser3\n$alg ollparity pllparity pllparitybigcubes -4```"
		+ `\nLes triggers usuels et composés :`
		+ "```parser3\n$alg F triplesexy F' hedge antisexy sledge```";
};

module.exports = {parseMoves, getAlgListHelpMessage};
