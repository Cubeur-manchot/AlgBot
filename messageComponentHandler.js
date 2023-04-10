"use strict";

class MessageComponentHandler {
	static componentTypes = {
		row: 1,
		button: 2,
		select: 3,
		textInput: 4
	};
	static buttonStyles = {
		primary: 1,
		link: 5
	};
	static createRow = components => {
		return {
			type: MessageComponentHandler.componentTypes.row,
			components: components
		};
	};
	static createSelect = valueLabelPairs => {
		return {
			type: MessageComponentHandler.componentTypes.select,
			options: valueLabelPairs,
			custom_id: "selectCustomId"
		};
	};
	static createLinkButton = (label, url) => {
		return {
			type: MessageComponentHandler.componentTypes.button,
			style: MessageComponentHandler.buttonStyles.link,
			label: label,
			url: url
		};
	};
	static createTestButton = () => {
		return {
			type: MessageComponentHandler.componentTypes.button,
			style: 1, // primary
			label: "toto",
			custom_id: "toto"
		};
	};
	constructor(messageHandler) {
		this.messageHandler = messageHandler;
	};
	createHelpComponents = selectedOption => {
		let selectOptions = [
			{label: "General help", value: "general"},
			{label: "Alg list", value: "algList"},
			{label: "Options", value: "options"}
		];
		selectOptions.forEach(selectOption => selectOption.default = selectOption.value === selectedOption);
		return [MessageComponentHandler.createRow([
			MessageComponentHandler.createSelect(selectOptions)
		])];
	};
};

export {MessageComponentHandler};
