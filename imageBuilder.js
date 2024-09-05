"use strict";

import Discord from "discord.js";
import {JSDOM} from "jsdom";
import {Runner} from "../holocube.js";
import xmlserializer from "xmlserializer";
import sharp from "sharp";

class ImageBuilder {
	static jsDomDocument = new JSDOM().window.document;
	static cubeImageSize = 150;
	static holoCubeVerbosityLevels = {
		off: 0,
		errors: 1,
		general: 2,
		detailed: 3,
		debug: 4
	};
	static holoCubeLoggerModes = {
		console: "console",
		htmlTag: "htmlTag",
		none: "none"
	};
	static holoCubeStatuses = {
		success: "success",
		fail: "fail"
	};
	constructor(algCommandHandler) {
		this.algCommandHandler = algCommandHandler;
	};
	buildPuzzleImage = async (moveSequence, optionsObject) => {
		let cubeSize = parseInt(optionsObject.puzzle.match(/\d+/)[0]);
		return await this.buildHoloCubeImage(moveSequence, optionsObject, cubeSize);
	};
	buildHoloCubeImage = async (moveSequence, optionsObject, cubeSize) => {
		let puzzleName = `cube${Array(3).fill(cubeSize).join("x")}`;
		let stage = optionsObject.stage === "cross" ? "Cross" : optionsObject.stage.toUpperCase();
		let view = optionsObject.view;
		let runner = new Runner({
			puzzle: {
				fullName: puzzleName,
				colorScheme: Object.values(optionsObject.colorScheme), // defined in fixed order : U, F, R, D, B, L
				mask: {
					stage: stage
				}
			},
			drawingOptions: {
				document: ImageBuilder.jsDomDocument,
				view: view,
				imageHeight: ImageBuilder.cubeImageSize,
				imageWidth: ImageBuilder.cubeImageSize,
				puzzleHeight: ImageBuilder.cubeImageSize * 0.8,
				puzzleWidth: ImageBuilder.cubeImageSize * 0.8
			},
			logger: {
				verbosity: ImageBuilder.holoCubeVerbosityLevels.off,
				mode: ImageBuilder.holoCubeLoggerModes.console
			}
		});
		let result = runner.run(optionsObject.isDo
			? moveSequence
			: this.algCommandHandler.algManipulator.invertSequence(moveSequence)
		);
		switch (result.status) {
			case ImageBuilder.holoCubeStatuses.success:
				let svg = result.svg;
				let pngBuffer = await this.convertSvgSvgElementToPngBuffer(svg);
				let fileName = "holoCubeImage.png";
				let attachment = new Discord.AttachmentBuilder(pngBuffer, {name: fileName});
				return {
					url: `attachment://${fileName}`,
					attachment: attachment,
					errors: []
				};
			case ImageBuilder.holoCubeStatuses.fail:
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
