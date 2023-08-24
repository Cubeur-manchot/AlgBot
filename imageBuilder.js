"use strict";

import {OptionsHandler} from "./optionsHandler.js";

class ImageBuilder {
	static cubeImageSize = 150;
	constructor(algCommandHandler) {
		this.algCommandHandler = algCommandHandler;
	};
	buildVisualCubeImage = (moveSequence, optionsObject, cubeSize) => {
		let urlBegin = "http://cube.rider.biz/visualcube.php";
		let view = optionsObject.view === OptionsHandler.planView ? "&view=plan" : "";
		let colorScheme = [
			optionsObject.colorScheme.U,
			optionsObject.colorScheme.R,
			optionsObject.colorScheme.F,
			optionsObject.colorScheme.D,
			optionsObject.colorScheme.L,
			optionsObject.colorScheme.B]
			.map(color => color[0]) // keep first letter only
			.join("");
		let stage = optionsObject.stage;
		let caseOrAlg = optionsObject.isDo ? "alg" : "case";
		let moveSequenceForVisualCube =
			this.algCommandHandler.algManipulator.replaceInnerSliceMoves(
				this.algCommandHandler.algManipulator.replaceMiddleSliceMoves(moveSequence, cubeSize)
			)
			.replace(/\s/g, "%20") // replace spaces
			.replace(/'/g, "%27"); // replace apostrophes
		return {
			url: `${urlBegin}?fmt=png&size=${ImageBuilder.cubeImageSize}&bg=t${view}&pzl=${cubeSize}&sch=${colorScheme}&stage=${stage}&${caseOrAlg}=${moveSequenceForVisualCube}`,
			errors: []
		};
	};
};

export {ImageBuilder};
