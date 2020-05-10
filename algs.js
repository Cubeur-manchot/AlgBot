"use strict";

const getMoveSequenceFromAlgName = algName => {
	let moveSequence;
	algName = algName.toLowerCase();
	if (algName.includes("pll_")) {
		moveSequence = algCollection.PLLCollection[algName];
	} else {
		moveSequence = algCollection.otherAlgCollection[algName];
	}
	return (moveSequence ? moveSequence.split(" ") : []);
};

const algCollection = {
	PLLCollection: {
		pll_aa: "l' U R' D2 R U' R' D2 R2 x'",
		pll_ab: "l' R' D2 R U R' D2 R U' R x'",
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
	otherAlgCollection: {
		sune: "R U R' U R U2' R'",
		antisune: "R U2 R' U' R U' R'"
	}
};

module.exports = {getMoveSequenceFromAlgName};