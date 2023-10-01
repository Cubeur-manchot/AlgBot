"use strict";

import Discord from "discord.js";
import {JSDOM} from "jsdom";
import {Runner} from "../holocube.js";
import xmlserializer from "xmlserializer";
import sharp from "sharp";
import {OptionsHandler} from "./optionsHandler.js";

class ImageBuilder {
	static jsDomDocument = new JSDOM().window.document;
	static cubeImageSize = 150;
	constructor(algCommandHandler) {
		this.algCommandHandler = algCommandHandler;
	};
	buildPuzzleImage = async (moveSequence, optionsObject) => {
		let cubeSize = parseInt(optionsObject.puzzle.match(/\d+/)[0]);
		return optionsObject.imageGenerator === OptionsHandler.holoCubeImageGenerator
		? await this.buildHoloCubeImage(moveSequence, optionsObject, cubeSize)
		: this.buildVisualCubeImage(moveSequence, optionsObject, cubeSize);
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
	buildHoloCubeImage = async (moveSequence, optionsObject, cubeSize) => {
		let runner = new Runner({
			puzzle: {
				fullName: `cube${Array(3).fill(cubeSize).join("x")}`,
				colorScheme: Object.values(optionsObject.colorScheme) // defined in fixed order : U, F, R, D, B, L
			},
			drawingOptions: {
				document: ImageBuilder.jsDomDocument,
				imageHeight: ImageBuilder.cubeImageSize,
				imageWidth: ImageBuilder.cubeImageSize,
				puzzleHeight: ImageBuilder.cubeImageSize * 0.8,
				puzzleWidth: ImageBuilder.cubeImageSize * 0.8
			},
			logger: {
				verbosity: 0
			}
		});
		let result = runner.run(optionsObject.isDo
			? moveSequence
			: this.algCommandHandler.algManipulator.invertSequence(moveSequence)
		);
		switch (result.status) {
			case "success":
				let svg = result.svg;
				let pngBuffer = await this.convertSvgSvgElementToPngBuffer(svg);
				let attachment = new Discord.AttachmentBuilder(pngBuffer, {name: "holoCubeImage.png"});
				return {
					url: "attachment://holoCubeImage.png",
					attachment: attachment,
					errors: []
				};
			case "fail":
				return {
					errors: result.errors
				};
		}
	};
	convertSvgSvgElementToPngBuffer = svgSvgElement => // sharp returns a promise (async)
		sharp(
			Buffer.from(
				xmlserializer.serializeToString(svgSvgElement)
			)
		)
		.toFormat("png")
		.toBuffer();
};

export {ImageBuilder};
