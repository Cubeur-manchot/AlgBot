"use strict";

class AlgManipulator {
	static unclosedCommutatorErrorMessage = {
		english: "Unclosed commutator",
		french: "Commutateur non fermé"
	};
	static unclosedConjugateErrorMessage = {
		english: "Unclosed conjugate",
		french: "Conjugué non fermé"
	};
	static unclosedParenthesisErrorMessage = {
		english: "Unclosed parenthesis",
		french: "Parenthèses non fermées"
	};
	static unclosedBracketStructureErrorMessage = {
		english: "Unclosed brackets",
		french: "Crochets non fermés"
	};
	static middleSeparatorInParenthesisErrorMessage = {
		english: "Middle separator in parenthesis",
		french: "Séparateur dans des parenthèses"
	};
	static missingMiddleSeparatorInBracketsErrorMessage = {
		english: "Missing middle separator in brackets",
		french: "Séparateur manquant dans les crochets"
	};
	static middleSeparatorOutOfBracketsErrorMessage = {
		english: "Middle separator out of brackets",
		french: "Séparateur hors des crochets"
	};
	static closingNonOpenStructureErrorMessage = {
		english: "Closing an non-open structure",
		french: "Fermeture d'une structure non ouverte"
	};
	static wrongClosingCharacterErrorMessage = {
		english: "Wrong closing character",
		french: "Mauvais caractère de fermeture"
	};
	static unrecognizedMoveErrorMessage = {
		english: "Unrecognized move",
		french: "Mouvement non reconnu"
	};
	constructor(algBot) {
		this.algBot = algBot;
		this.algCollection = new AlgCollection(this);
		this.unclosedCommutatorErrorMessage = AlgManipulator.unclosedCommutatorErrorMessage[this.algBot.language];
		this.unclosedConjugateErrorMessage = AlgManipulator.unclosedConjugateErrorMessage[this.algBot.language];
		this.unclosedParenthesisErrorMessage = AlgManipulator.unclosedParenthesisErrorMessage[this.algBot.language];
		this.unclosedBracketStructureErrorMessage = AlgManipulator.unclosedBracketStructureErrorMessage[this.algBot.language];
		this.middleSeparatorInParenthesisErrorMessage = AlgManipulator.middleSeparatorInParenthesisErrorMessage[this.algBot.language];
		this.missingMiddleSeparatorInBracketsErrorMessage = AlgManipulator.missingMiddleSeparatorInBracketsErrorMessage[this.algBot.language];
		this.middleSeparatorOutOfBracketsErrorMessage = AlgManipulator.middleSeparatorOutOfBracketsErrorMessage[this.algBot.language];
		this.closingNonOpenStructureErrorMessage = AlgManipulator.closingNonOpenStructureErrorMessage[this.algBot.language];
		this.wrongClosingCharacterErrorMessage = AlgManipulator.wrongClosingCharacterErrorMessage[this.algBot.language];
		this.unrecognizedMoveErrorMessage = AlgManipulator.unrecognizedMoveErrorMessage[this.algBot.language];
	};
	parseMoveSequence = moveSequenceString => {
		// todo clean errors : structures detection
		let errors = [];
		let openingSeparators = ["[", "("];
		let middleSeparators = [",", ":"];
		let closingSeparators = ["]", ")"];
		let separatorRegexp = new RegExp(
			`([${openingSeparators.join("")}${middleSeparators.join("")}]|[${closingSeparators.map(separator => `\\${separator}`).join("")}]\\d*'?)`
		);
		let splitMoveSequence = moveSequenceString
			.replace(/’/g, "'") // replace wrong apostrophe typography
			.split(separatorRegexp) // split with structuring characters
			.filter(chunk => chunk.length !== 0);
		let stack = [{
			partialMoveSequence: ""
		}];
		let movePatternsRegex = /([xyz]|\d+-\d+([RUFLDB]w|[rufldb])|\d*([RUFLDB]w?|[rufldbMES]))\d*'?(?!-)/g;
		for (let moveSequenceChunk of splitMoveSequence) {
			if (!separatorRegexp.test(moveSequenceChunk)) { // not structuring character (standard moves)
				let moveSequenceCleanedChunk = [];
				for (let word of moveSequenceChunk.split(" ").filter(word => word.length !== 0)) {
					let moveMatches = word.match(movePatternsRegex);
					if (moveMatches && moveMatches.join("").length === word.length) { // word is fully composed of known moves
						moveSequenceCleanedChunk.push(moveMatches.join(" "));
					} else {
						let alg = this.algCollection.findAlg(word.toLowerCase());
						if (alg) {
							moveSequenceCleanedChunk.push(alg);
						} else {
							errors.push({
								scope: word,
								message: this.unrecognizedMoveErrorMessage
							});
						}
					}
				}
				stack[stack.length - 1].partialMoveSequence += ` ${moveSequenceCleanedChunk.join(" ")}`;
				continue;
			}
			if (openingSeparators.includes(moveSequenceChunk)) { // opening character
				stack[stack.length - 1].openingSeparator = moveSequenceChunk;
				stack.push({
					partialMoveSequence: ""
				});
			} else if (middleSeparators.includes(moveSequenceChunk)) { // middle separator
				let openingSeparator = stack[stack.length - 1].openingSeparator;
				if (openingSeparator === "[") {
					stack[stack.length - 2].middleSeparator = moveSequenceChunk;
					stack[stack.length - 2].leftMember = stack[stack.length - 1].partialMoveSequence;
					stack[length - 1] = {
						partialMoveSequence: ""
					};
				} else {
					errors.push({
						scope: moveSequenceChunk,
						message: openingSeparator === "("
							? this.middleSeparatorInParenthesisErrorMessage
							: this.middleSeparatorOutOfBracketsErrorMessage
					});
					break;
				}
			} else { // closing character
				let closingSeparator = moveSequenceChunk[0];
				if (stack.length < 2) {
					errors.push({
						scope: closingSeparator,
						message: this.closingNonOpenStructureErrorMessage
					});
					break;
				}
				if (closingSeparator !== stack[stack.length - 2].openingSeparator) {
					errors.push({
						scope: closingSeparator,
						message: this.wrongClosingCharacterErrorMessage
					});
					break;
				}
				let structureMoveSequence;
				if (closingSeparator === ")") {
					structureMoveSequence = stack[stack.length - 1].partialMoveSequence.trim();
				} else {
					let middleSeparator = stack[stack.length - 2].middleSeparator;
					if (middleSeparator === ",") {
						structureMoveSequence = this.commutator(stack[stack.length - 2].leftMember, stack[stack.length - 1].partialMoveSequence);
					} else if (middleSeparator === ":") {
						structureMoveSequence = this.conjugate(stack[stack.length - 2].leftMember, stack[stack.length - 1].partialMoveSequence);
					} else {
						errors.push({
							message: this.missingMiddleSeparatorInBracketsErrorMessage
						});
						break;
					}
				}
				if (moveSequenceChunk[moveSequenceChunk.length - 1] === "'") {
					structureMoveSequence = this.invertSequence(structureMoveSequence);
				}
				let multiplier = (moveSequenceChunk.match(/\d+/) ?? ["1"])[0];
				structureMoveSequence = this.repeatSequence(structureMoveSequence, parseInt(multiplier));
				stack[stack.length - 2] = {
					partialMoveSequence: `${stack[stack.length - 2].partialMoveSequence} ${structureMoveSequence}`
				};
				stack.pop();
			}
		}
		if (stack[0].openingSeparator) { // unclosed structure
			errors.push({
				message: this.getUnclosedStructureErrorMessage(stack[0].openingSeparator, stack[0].middleSeparator)
			});
		}
		let moveSequence = stack[0].partialMoveSequence.trim();
		return {
			moveSequence: moveSequence,
			errors: errors
		};
	};
	getUnclosedStructureErrorMessage = (openingSeparator, middleSeparator) => {
		switch (openingSeparator) {
			case "(": return this.unclosedParenthesisErrorMessage;
			case "[":
				switch (middleSeparator) {
					case ",": return this.unclosedCommutatorErrorMessage;
					case ":": return this.unclosedConjugateErrorMessage;
					default: return this.unclosedBracketStructureErrorMessage;
				};
		};
	};
	commutator = (leftMember, rightMember) => {
		let trimmedLeftMember = leftMember.trim();
		let trimmedRightMember = rightMember.trim();
		return `${trimmedLeftMember} ${trimmedRightMember} ${this.invertSequence(trimmedLeftMember)} ${this.invertSequence(trimmedRightMember)}`;
	};
	conjugate = (leftMember, rightMember) => {
		let trimmedLeftMember = leftMember.trim();
		let trimmedRightMember = rightMember.trim();
		return `${trimmedLeftMember} ${trimmedRightMember} ${this.invertSequence(trimmedLeftMember)}`;
	};
	invertSequence = moveSequence => {
		return moveSequence
			.split(" ")
			.map(move => this.invertMove(move))
			.reverse()
			.join(" ");
	};
	invertMove = move => {
		return move.includes("'")
			? move.slice(0, -1)
			: `${move}'`;
	};
	repeatSequence = (moveSequence, times) => {
		return Array(times).fill(moveSequence).join(" ");
	};
	replaceMiddleSliceMoves = (moveSequence, cubeSize) => {
		return moveSequence
			.split(" ")
			.map(move => {
				if (/^\d+[MES]/.test(move)) {
					let sliceCount = parseInt(move.match(/^\d+/)[0]);
					let sliceLayer = move.match(/[MES]/)[0];
					let outerSliceCount = (cubeSize - sliceCount) / 2;
					let newMove = `${outerSliceCount + 1}-${cubeSize - outerSliceCount}`
						+ (sliceLayer === "M" ? "R" : sliceLayer === "E" ? "U" : "F")
						+ `w${move.replace(/^\d+[MES]/, "")}`;
					return sliceLayer !== "S" ? this.invertMove(newMove) : newMove;
				} else {
					return move;
				}
			})
			.join(" ");
	};
	replaceInnerSliceMoves = moveSequence => {
		let simplifiedMoveSequence = [];
		for (let move of moveSequence.split(" ")) {
			if (/\d[RUFLDB](?!w)/.test(move)) { // moves of the form 3R
				let [sliceNumber, face, restOfMove] = move.split(/([RUFLDB])/);
				simplifiedMoveSequence.push(`${sliceNumber}${face}${sliceNumber > 1 ? "w" : ""}${restOfMove}`);
				simplifiedMoveSequence.push(this.invertMove(`${parseInt(sliceNumber) - 1}${face}${sliceNumber > 2 ? "w" : ""}${restOfMove}`));
			} else if (/\d+-\d[RUFLDB]/.test(move)) { // moves of the form 2-4Rw
				let [, firstSliceNumber, , secondSliceNumber, face, ...restOfMove] = move.split(/(\d+)/);
				firstSliceNumber = parseInt(firstSliceNumber);
				secondSliceNumber = parseInt(secondSliceNumber);
				[firstSliceNumber, secondSliceNumber] = [
					Math.min(firstSliceNumber, secondSliceNumber),
					Math.max(firstSliceNumber, secondSliceNumber)
				];
				face = face.replace("w", "");
				restOfMove = restOfMove.join("");
				simplifiedMoveSequence.push(`${secondSliceNumber}${face}${secondSliceNumber > 1 ? "w" : ""}${restOfMove}`);
				simplifiedMoveSequence.push(this.invertMove(`${firstSliceNumber - 1}${face}${firstSliceNumber > 2 ? "w" : ""}${restOfMove}`));
			} else {
				simplifiedMoveSequence.push(move);
			}
		}
		return simplifiedMoveSequence.join(" ");
	};
	countMoves = moveSequence => {
		let moveCounts = {
			htm: 0,
			stm: 0,
			qtm: 0,
			etm: 0
		};
		for (let move of moveSequence.split(" ")) {
			if (/[xyz]/.test(move)) { // rotation moves : x
				moveCounts.etm++;
			} else if (/(?<!\d)[RUFLDB]|(?<!-.*)([RUFLDB]w|[rufldb])/.test(move)) { // outer block moves : R, Rw, r, 3Rw, 3r
				moveCounts.htm++;
				moveCounts.stm++;
				moveCounts.qtm += parseInt((move.match(/(?<=[RUFLDBrufldb].*)\d+/) ?? ["1"])[0]);
				moveCounts.etm++;
			} else { // inner slice moves : M, 2R, 2-3Rw
				moveCounts.htm += 2;
				moveCounts.stm++;
				moveCounts.qtm += parseInt((move.match(/(?<=[MESRUFLDBrufldb].*)\d+/) ?? ["1"])[0]);
				moveCounts.etm++;
			}
		}
		return moveCounts;
	};
};

class AlgCollection {
	static knownAlgs = {
		// sunes
		sune: "R U R' U R U2' R'",
		antisune: "R U2 R' U' R U' R'",
		backsune: "R' U' R U' R' U2 R",
		backantisune: "R' U2 R U R' U R",
		leftsune: "L' U' L U' L' U2 L",
		leftantisune: "L' U2 L U L' U L",
		leftbacksune: "L U L' U L U2 L'",
		leftbackantisune: "L U2 L' U' L U' L'",
		fatsune: "r U R' U R U2' r'",
		fatantisune: "r U2 R' U' R U' r'",
		fatbacksune: "r' U' R U' R' U2 r",
		fatbackantisune: "r' U2 R U R' U r",
		fatleftsune: "l' U' L U' L' U2 l",
		fatleftantisune: "l' U2 L U L' U l",
		fatleftbacksune: "l U L' U L U2 l'",
		fatleftbackantisune: "l U2 L' U' L U' l'",
		doublesune: "R U R' U R U' R' U R U2' R'",
		doubleantisune: "R U2 R' U' R U R' U' R U' R'",
		doublebacksune: "R' U' R U' R' U R U' R' U2 R",
		doublebackantisune: "R' U2 R U R' U' R U R' U R",
		doubleleftsune: "L' U' L U' L' U L U' L' U2 L",
		doubleleftantisune: "L' U2 L U L' U' L U L' U L",
		doubleleftbacksune: "L U L' U L U' L' U L U2 L'",
		doubleleftbackantisune: "L U2 L' U' L U L' U' L U' L'",
		doublefatsune: "r U R' U R U' R' U R U2' r'",
		doublefatantisune: "r U2 R' U' R U R' U' R U' r'",
		doublefatbacksune: "r' U' R U' R' U R U' R' U2 r",
		doublefatbackantisune: "r' U2 R U R' U' R U R' U r",
		doublefatleftsune: "l' U' L U' L' U L U' L' U2 l",
		doublefatleftantisune: "l' U2 L U L' U' L U L' U l",
		doublefatleftbacksune: "l U L' U L U' L' U L U2 l'",
		doublefatleftbackantisune: "l U2 L' U' L U L' U' L U' l'",
		triplesune: "R U R' U R U' R' U R U' R' U R U2' R'",
		tripleantisune: "R U2 R' U' R U R' U' R U R' U' R U' R'",
		triplebacksune: "R' U' R U' R' U R U' R' U R U' R' U2 R",
		triplebackantisune: "R' U2 R U R' U' R U R' U' R U R' U R",
		tripleleftsune: "L' U' L U' L' U L U' L' U L U' L' U2 L",
		tripleleftantisune: "L' U2 L U L' U' L U L' U' L U L' U L",
		tripleleftbacksune: "L U L' U L U' L' U L U' L' U L U2 L'",
		tripleleftbackantisune: "L U2 L' U' L U L' U' L U L' U' L U' L'",
		triplefatsune: "r U R' U R U' R' U R U' R' U R U2' r'",
		triplefatantisune: "r U2 R' U' R U R' U' R U R' U' R U' r'",
		triplefatbacksune: "r' U' R U' R' U R U' R' U R U' R' U2 r",
		triplefatbackantisune: "r' U2 R U R' U' R U R' U' R U R' U r",
		triplefatleftsune: "l' U' L U' L' U L U' L' U L U' L' U2 l",
		triplefatleftantisune: "l' U2 L U L' U' L U L' U' L U L' U l",
		triplefatleftbacksune: "l U L' U L U' L' U L U' L' U L U2 l'",
		triplefatleftbackantisune: "l U2 L' U' L U L' U' L U L' U' L U' l'",

		// triggers - sexys
		sexy: "R U R' U'",
		antisexy: "U R U' R'",
		unsexy: "U R U' R'",
		backsexy: "R' U' R U",
		backantisexy: "U' R' U R",
		leftsexy: "L' U' L U",
		leftantisexy: "U' L' U L",
		doublesexy: "R U R' U' R U R' U'",
		doubleantisexy: "U R U' R' U R U' R'",
		backdoublesexy: "R' U' R U R' U' R U",
		backdoubleantisexy: "U' R' U R U' R' U R",
		leftdoublesexy: "L' U' L U L' U' L U",
		leftdoubleantisexy: "U' L' U L U' L' U L",
		triplesexy: "R U R' U' R U R' U' R U R' U'",
		tripleantisexy: "U R U' R' U R U' R' U R U' R'",
		backtriplesexy: "R' U' R U R' U' R U R' U' R U",
		backtripleantisexy: "U' R' U R U' R' U R U' R' U R",
		lefttriplesexy: "L' U' L U L' U' L U L' U' L U",
		lefttripleantisexy: "U' L' U L U' L' U L U' L' U L",

		// triggers - sledges
		sledge: "R' F R F'",
		hedge: "F R' F' R",
		backsledge: "R B' R' B",
		backhedge: "B' R B R'",
		leftsledge: "L F' L' F",
		lefthedge: "F' L F L'",
		doublesledge: "R' F R F' R' F R F'",
		doublehedge: "F R' F' R F R' F' R",
		doublebacksledge: "R B' R' B R B' R' B",
		doublebackhedge: "B' R B R' B' R B R'",
		leftdoublesledge: "L F' L' F L F' L' F",
		leftdoublehedge: "F' L F L' F' L F L'",
		triplesledge: "R' F R F' R' F R F' R' F R F'",
		triplehedge: "F R' F' R F R' F' R F R' F' R",
		backtriplesledge: "R B' R' B R B' R' B R B' R' B",
		backtriplehedge: "B' R B R' B' R B R' B' R B R'",
		lefttriplesledge: "L F' L' F L F' L' F L F' L' F",
		lefttriplehedge: "F' L F L' F' L F L' F' L F L'",

		// OLL
		oll_1: "R U2' R2' F R F' U2' R' F R F'",
		oll_2: "F R U R' U' S R U R' U' f'",
		oll_3: "f R U R' U' f' U' F R U R' U' F'",
		oll_4: "f R U R' U' f' U F R U R' U' F'",
		oll_5: "r' U2' R U R' U r",
		oll_6: "r U2' R' U' R U' r'",
		oll_7: "r U R' U R U2' r'",
		oll_8: "r' U' R U' R' U2' r",
		oll_9: "R U R' U' R' F R2 U R' U' F'",
		oll_10: "R U R' U R' F R F' R U2' R'",
		oll_11: "r' R2 U R' U R U2' R' U M'",
		oll_12: "r R2' U' R U' R' U2' R U' r' R",
		oll_13: "F U R U2 R' U' R U R' F'",
		oll_14: "R' F R U R' F' R F U' F'",
		oll_15: "r' U' r R' U' R U r' U r",
		oll_16: "r U r' R U R' U' r U' r'",
		oll_17: "R U R' U R' F R F' U2' R' F R F'",
		oll_18: "r U R' U R U2' r2' U' R U' R' U2' r",
		oll_19: "r' U2' R U R' U r2 U2' R' U' R U' r'",
		oll_20: "r U R' U' M2' U R U' R' U' M'",
		oll_21: "R U2 R' U' R U R' U' R U' R'",
		oll_22: "R U2' R2' U' R2 U' R2' U2' R",
		oll_23: "R2' D' R U2 R' D R U2 R",
		oll_24: "r U R' U' r' F R F'",
		oll_25: "F' r U R' U' r' F R",
		oll_26: "R U2' R' U' R U' R'",
		oll_27: "R U R' U R U2' R'",
		oll_28: "r U R' U' M U R U' R'",
		oll_29: "r2' D' r U r' D r2 U' r' U' r",
		oll_30: "r' D' r U' r' D r2 U' r' U r U r'",
		oll_31: "R' U' F U R U' R' F' R",
		oll_32: "S R U R' U' R' F R f'",
		oll_33: "R U R' U' R' F R F'",
		oll_34: "R U R' U' B' R' F R F' B",
		oll_35: "R U2' R2' F R F' R U2' R'",
		oll_36: "L' U' L U' L' U L U L F' L' F",
		oll_37: "F R U' R' U' R U R' F'",
		oll_38: "R U R' U R U' R' U' R' F R F'",
		oll_39: "L F' L' U' L U F U' L'",
		oll_40: "R' F R U R' U' F' U R",
		oll_41: "R U R' U R U2' R' F R U R' U' F'",
		oll_42: "R' U' R U' R' U2' R F R U R' U' F'",
		oll_43: "R' U' F' U F R",
		oll_44: "F U R U' R' F'",
		oll_45: "F R U R' U' F'",
		oll_46: "R' U' R' F R F' U R",
		oll_47: "F' L' U' L U L' U' L U F",
		oll_48: "F R U R' U' R U R' U' F'",
		oll_49: "r U' r2' U r2 U r2' U' r",
		oll_50: "r' U r2 U' r2' U' r2 U r'",
		oll_51: "F U R U' R' U R U' R' F'",
		oll_52: "R' U' R U' R' U F' U F R",
		oll_53: "r' U2' R U R' U' R U R' U r",
		oll_54: "r U2' R' U' R U R' U' R U' r'",
		oll_55: "R U2' R2' U' R U' R' U2' F R F'",
		oll_56: "r U r' U R U' R' U R U' R' r U' r'",
		oll_57: "R U R' U' M' U R U' r'",

		// PLL
		pll_aa: "x R' U R' D2 R U' R' D2 R2 x'",
		pll_ab: "x R2' D2 R U R' D2 R U' R x'",
		pll_e: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
		pll_f: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
		pll_ga: "R2 U R' U R' U' R U' R2 D U' R' U R D'",
		pll_gb: "F' U' F R2 u R' U R U' R u' R2'",
		pll_gc: "R2' u' R U' R U R' u R2 f R' f'",
		pll_gd: "f R f' R2' u' R U' R' U R' u R2",
		pll_h: "M2' U M2' U2 M2' U M2'",
		pll_ja: "R' U L' U2 R U' R' U2 R L",
		pll_jb: "R U R' F' R U R' U' R' F R2 U' R'",
		pll_j: "R U R' F' R U R' U' R' F R2 U' R'",
		pll_na: "F' R U R' U' R' F R2 F U' R' U' R U F' R'",
		pll_nb: "r' D' F r U' r' F' D r2 U r' U' r' F r F'",
		pll_ra: "R U' R' U' R U R D R' U' R D' R' U2 R'",
		pll_rb: "R' U2 R U2 R' F R U R' U' R' F' R2",
		pll_t: "R U R' U' R' F R2 U' R' U' R U R' F'",
		pll_ua: "R U R' U R' U' R2 U' R' U R' U R",
		pll_ub: "R' U R' U' R' U' R' U R U R2",
		pll_v: "R' U R' d' R' F' R2 U' R' U R' F R F",
		pll_y: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
		pll_z: "M2' U M2' U M' U2 M2' U2 M'",

		// CMLL
		cmll_oright: "R U R' F' R U R' U' R' F R2 U' R'",
		cmll_odiag: "r2 D r' U r D' r2 B r U' r' B'",
		cmll_unoswap: "R U R' U R U2' R2' U' R U' R' U2 R",
		cmll_udiag: "F R U R' U' F'",
		cmll_uback: "F R2 D R' U R D' R2' U' F'",
		cmll_uright: "R2 D R' U2 R D' R' U2 R'",
		cmll_ufront: "r U' r' U r' D' r U' r' D r",
		cmll_uleft: "R2' D' R U2 R' D R U2 R",
		cmll_tnoswap: "R U2' R' U' R U' R2' U2' R U R' U R",
		cmll_tdiag: "r U' r2' D' r U2 r' D r2 U r'",
		cmll_tback: "r U' r' U' F R' F' R2 U' R'",
		cmll_tright: "L' U' L U r U' r' F",
		cmll_tfront: "r' D' r U r' D r U' r U r'",
		cmll_tleft: "R U R' U' R' F R F'",
		cmll_lnoswap: "R U R' U R U' R' U R U' R' U R U2' R'",
		cmll_ldiag: "R U2' R2' F R F' R U2' R'",
		cmll_lback: "R U2 R D R' U2 R D' R2'",
		cmll_lright: "F R' F' R U R U' R'",
		cmll_lfront: "F R U' R' U' R U R' F'",
		cmll_lleft: "R' U2 R' D' R U2 R' D R2",
		cmll_hnoswap: "R U R' U R U' R' U R U2' R'",
		cmll_hdiag: "F R U R' U' R U R' U' R U R' U' F'",
		cmll_hright: "R U2' R2' F R F' U2' R' F R F'",
		cmll_hfront: "r U' r2' D' r U' r' D r2 U r'",
		cmll_pinoswap: "R' U' R' F R F' R U' R' U2 R",
		cmll_pidiag: "F R' F' R U2 R U' R' U R U2' R'",
		cmll_piback: "F R' F' R U2 R U' R' U R U2' R'",
		cmll_piright: "R' F R U F U' R U R' U' F'",
		cmll_pifront: "R U2 R' U' R U R' U2' R' F R F'",
		cmll_pileft: "r U' r2' D' r U r' D r2 U r'",
		cmll_snoswap: "R U R' U R U2' R'",
		cmll_sdiag: "R U R' U R' F R F' R U2' R'",
		cmll_sback: "F R' F' R U2 R U2' R'",
		cmll_sright: "R' F2 R2 U2' R' F R U2' R2' F2 R",
		cmll_sfront: "r U' r' F R' F' R",
		cmll_sleft: "L' U2 L U2 r U' r' F",
		cmll_asnoswap: "R U2' R' U' R U' R'",
		cmll_asdiag: "R U2' R' U' R U R2' F R F' R U2' R'",
		cmll_asback: "F' r U r' U2' L' U2 L",
		cmll_asright: "R U2' R' U2 R' F R F'",
		cmll_asfront: "R' F R F' r U r'",
		cmll_asleft: "R' F2 R2 U2' R' F' R U2' R2' F2 R",

		// niklas
		niklasright: "R U' L' U R' U' L",
		niklasleft: "L' U R U' L U R'",

		// parities
		"4x4ollparity": "r U2 x r U2 r U2' r' U2 l U2 r' U2' r U2 r' U2' r'",
		"4x4pllparity": "Rw2 R2 U2 Rw2 R2 Uw2 Rw2 R2 Uw2",
		"4x4pllparitybigcubes": "Rw2' F2 U2 Rw2 R2' U2 F2 Rw2"
	};
	constructor(algManipulator) {
		this.algManipulator = algManipulator;
	};
	findAlg = (word) => {
		if (word.endsWith("sune")) { // sune variations, reorder variation words
			let suneVariation = "";
			for (let variation of ["double", "triple", "fat", "back", "left", "anti"]) {
				suneVariation += (word.match(new RegExp(variation)) ?? [""])[0];
			}
			if (suneVariation.length === word.length
				&& !(word.includes("double") && word.includes("triple"))) {
					return AlgManipulator.knownAlgs[suneVariation];
			} else {
				return;
			}
		} else {
			return AlgCollection.knownAlgs[word];
		}
	};
};

export {AlgManipulator};
