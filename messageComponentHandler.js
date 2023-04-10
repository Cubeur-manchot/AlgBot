"use strict";

import Discord from "discord.js";

class MessageComponentHandler {
	static buttonStyles = {
		primary: 1,
		link: 5
	};
	static createRow = components => {
		return {
			type: Discord.ComponentType.ActionRow,
			components: components
		};
	};
	static createSelect = valueLabelPairs => {
		return {
			type: Discord.ComponentType.SelectMenu,
			options: valueLabelPairs,
			custom_id: "selectCustomId"
		};
	};
	static createLinkButton = (label, url) => {
		return {
			style: MessageComponentHandler.buttonStyles.link,
			type: Discord.ComponentType.Button,
			label: label,
			url: url
		};
	};
	static createTestButton = () => {
		return {
			style: 1, // primary
			type: Discord.ComponentType.Button,
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
