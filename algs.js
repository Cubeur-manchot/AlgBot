"use strict";

const parseMoves = moves => {
	let moveSequence = [];
	for (let move of moves) {
		moveSequence.push(deployMove(move));
	}
	return moveSequence.join(" ");
};

const deployMove = move => {
	if (/^[\\$!.?]/.test(move)) { // don't insert commands for other bots
		return "";
	}
	let moveLower = move.toLowerCase();
	if (moveLower.includes("pll_")) { // move is actually a PLL
		return algCollection.PLLCollection[moveLower];
	} else if (moveLower.includes("sune") || moveLower.includes("niklas") || moveLower.includes("paritynode ")) { // move is a basic alg
		return algCollection.basicAlgs[moveLower];
	} else if (moveLower.includes("edge") || moveLower.includes("sexy")) { // move is a trigger or composition
		return algCollection.otherAlgCollection[moveLower];
	} else { // normal move
		return move;
	}
};

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
	basicAlgs: {
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
		niklasgauche: "L' U R U' L U R'",
		ollparity: "r U2 x r U2 r U2' r' U2 l U2 r' U2' r U2 r' U2' r'",
		pllparity: "Rw2 R2 U2 Rw2 R2 Uw2 Rw2 R2 Uw2"
	},
	otherAlgCollection: {
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
	}
};

module.exports = {parseMoves};
