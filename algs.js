"use strict";

const getMoveSequenceFromAlgName = algName => {
	let moveSequence;
	if (algName.includes("PLL_")) {
		moveSequence = algCollection.PLLCollection[algName];
	} else {
		moveSequence = algCollection.otherAlgCollection[algName.toLowerCase()];
	}
	return (moveSequence ? moveSequence.split(" ") : []);
};

const algCollection = {
	PLLCollection: {
		PLL_Aa: "l' U R' D2 R U' R' D2 R2 x'",
		PLL_Ab: "l' R' D2 R U R' D2 R U' R x'",
		PLL_E: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
		PLL_F: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
		PLL_Ga: "R2 u R' U R' U' R u' R2' F' U F",
		PLL_Gb: "F' U' F R2 u R' U R U' R u' R2'",
		PLL_Gc: "R2' u' R U' R U R' u R2 f R' f'",
		PLL_Gd: "f R f' R2' u' R U' R' U R' u R2",
		PLL_H: "M2' U M2' U2 M2' U M2'",
		PLL_Ja: "R' U L' U2 R U' R' U2 R L",
		PLL_Jb: "R U R' F' R U R' U' R' F R2 U' R'",
		PLL_J: "R U R' F' R U R' U' R' F R2 U' R'",
		PLL_Na: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
		PLL_Nb: "R' U L' U2 R U' L R' U L' U2 R U' L",
		PLL_Ra: "R U R' F' R U2 R' U2' R' F R U R U2' R'",
		PLL_Rb: "R' U2 R U2 R' F R U R' U' R' F' R2",
		PLL_T: "R U R' U' R' F R2 U' R' U' R U R' F'",
		PLL_Ua: "R2 U' R' U' R U R U R U' R",
		PLL_Ub: "R' U R' U' R' U' R' U R U R2",
		PLL_V: "R' U R' d' R' F' R2 U' R' U R' F R F",
		PLL_Y: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
		PLL_Z: "M2' U M2' U M' U2 M2' U2 M'"
	},
	otherAlgCollection: {
		sune: "R U R' U R U2' R'",
		antisune: "R U2 R' U' R U' R'"
	}
};

module.exports = {getMoveSequenceFromAlgName};
