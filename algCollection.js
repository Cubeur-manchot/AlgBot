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
		pll_na: "F' R U R' U' R' F R2 F U' R' U' R U F' R'",
		pll_nb: "r' D' F r U' r' F' D r2 U r' U' r' F r F'",
		pll_ra: "R U' R' U' R U R D R' U' R D' R' U2 R'",
		pll_rb: "R' U2 R U2 R' F R U R' U' R' F' R2",
		pll_t: "R U R' U' R' F R2 U' R' U' R U R' F'",
		pll_ua: "R2 U' R' U' R U R U R U' R",
		pll_ub: "R' U R' U' R' U' R' U R U R2",
		pll_v: "R' U R' d' R' F' R2 U' R' U R' F R F",
		pll_y: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
		pll_z: "M2' U M2' U M' U2 M2' U2 M'"
	},
	OLLCollection: {
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
		oll_30: "F U R U2' R' U' R U2 R' U' F'",
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
		oll_57: "R U R' U' M' U R U' r'"
	},
	CMLLCollection: {
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
		cmll_asleft: "R' F2 R2 U2' R' F' R U2' R2' F2 R"
	},
	basicAlgsCollection: {
		sune: "R U R' U R U2' R'",
		fatsune: "r U R' U R U2' r'",
		antisune: "R U2 R' U' R U' R'",
		fatantisune: "r U2 R' U' R U' r'",
		leftsune: "L' U' L U' L' U2 L",
		leftfatsune: "l' U' L U' L' U2 l",
		leftantisune: "L' U2 L U L' U L",
		leftfatantisune: "l' U2 L U L' U l",
		backsune: "R' U' R U' R' U2 R",
		backfatsune: "r' U' R U' R' U2 r",
		backantisune: "R' U2 R U R' U R",
		backfatantisune: "r' U2 R U R' U r",
		leftbacksune: "L U L' U L U2 L'",
		leftbackfatsune: "l U L' U L U2 l'",
		leftbackantisune: "L U2 L' U' L U' L'",
		leftbackfatantisune: "l U2 L' U' L U' l'",
		doublesune: "R U R' U R U' R' U R U2' R'",
		doublefatsune: "r U R' U R U' R' U R U2' r'",
		doubleantisune: "R U2 R' U' R U R' U' R U' R'",
		doublefatantisune: "r U2 R' U' R U R' U' R U' r'",
		doublebacksune: "R' U' R U' R' U R U' R' U2 R",
		doublebackfatsune: "r' U' R U' R' U R U' R' U2 r",
		doublebackantisune: "R' U2 R U R' U' R U R' U R",
		doublebackfatantisune: "r' U2 R U R' U' R U R' U r",
		triplesune: "R U R' U R U' R' U R U' R' U R U2' R'",
		tripleantisune: "R U2 R' U' R U R' U' R U R' U' R U' R'",
		niklasright: "R U' L' U R' U' L",
		niklasleft: "L' U R U' L U R'"
	},
	triggerCollection: {
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
		sexy: "R U R' U'",
		antisexy: "U R U' R'",
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
		lefttripleantisexy: "U' L' U L U' L' U L U' L' U L"
	},
	parity4x4x4Collection: {
		ollparity: "r U2 x r U2 r U2' r' U2 l U2 r' U2' r U2 r' U2' r'",
		pllparity: "Rw2 R2 U2 Rw2 R2 Uw2 Rw2 R2 Uw2",
		pllparitybigcubes: "Rw2' F2 U2 Rw2 R2' U2 F2 Rw2"
	}
};

const getAlgListHelpMessage = language => {
	if (language === "french") {
		return "Je peux insérer directement des algos enregistrés.\nLes algos enregistrés sont les suivants :\n"
			+ "\nToutes les PLL : `PLL_Aa`, `PLL_Ab`, `PLL_E`, `PLL_F`, `PLL_Ga`, `PLL_Gb`, `PLL_Gc`, `PLL_Gd`, `PLL_H`, `PLL_Ja`, `PLL_Jb`, "
			+ "`PLL_Na`, `PLL_Nb`, `PLL_Ra`, `PLL_Rb`, `PLL_T`, `PLL_Ua`, `PLL_Ub`, `PLL_V`, `PLL_Y`, `PLL_Z` :"
			+ "```parser3\n$alg R' PLL_Y R```"
			+ "\nToutes les OLL : `OLL_1`, `OLL_2`, ..., `OLL_57` :"
			+ "```parser3\n$alg OLL_37 -oll```"
			+ "\nToutes les CMLL : `CMLL_Hnoswap`, `CMLL_ASdiag`, `CMLL_Lright`, ... :"
			+ "```parser3\n$alg CMLL_Hnoswap -cmll```"
			+ "\nLes sunes, antisunes et composés, les niklas :"
			+ "```parser3\n$alg tripleantisune niklasright```"
			+ "\nLes parités du <:4x4x4:751139156863877251> :"
			+ "```parser3\n$alg ollparity pllparity pllparitybigcubes -4```"
			+ "\nLes triggers usuels et composés :"
			+ "```parser3\n$alg F triplesexy F' hedge antisexy sledge```"
			+ "\nLes commutateurs, conjugués et multiples sont également supportés :"
			+ "```parser3\n$alg F (sexy)3' F' [R' U' : [R', F]]```";
	} else { // english
		return "I can directly insert registered algs.\nRegistered algs are the followings :\n"
			+ "\nAll the PLL : `PLL_Aa`, `PLL_Ab`, `PLL_E`, `PLL_F`, `PLL_Ga`, `PLL_Gb`, `PLL_Gc`, `PLL_Gd`, `PLL_H`, `PLL_Ja`, `PLL_Jb`, "
			+ "`PLL_Na`, `PLL_Nb`, `PLL_Ra`, `PLL_Rb`, `PLL_T`, `PLL_Ua`, `PLL_Ub`, `PLL_V`, `PLL_Y`, `PLL_Z` :"
			+ "```parser3\n$alg R' PLL_Y R```"
			+ "\nAll the OLL : `OLL_1`, `OLL_2`, ..., `OLL_57` :"
			+ "```parser3\n$alg OLL_37 -oll```"
			+ "\nAll the CMLL : `CMLL_Hnoswap`, `CMLL_ASdiag`, `CMLL_Lright`, ... :"
			+ "```parser3\n$alg CMLL_Hnoswap -cmll```"
			+ "\nSunes, antisunes and compositions of them, niklas :"
			+ "```parser3\n$alg tripleantisune niklasright```"
			+ "\n<:4x4x4:751139156863877251> parities :"
			+ "```parser3\n$alg ollparity pllparity pllparitybigcubes -4```"
			+ "\nUsual triggers and compositions of them :"
			+ "```parser3\n$alg F triplesexy F' hedge antisexy sledge```"
			+ "\nCommutators, conjugates and multiples are also supported :"
			+ "```parser3\n$alg F (sexy)3' F' [R' U' : [R', F]]```";
	}
};

module.exports = {algCollection, getAlgListHelpMessage};
