"use strict";

import Discord from "discord.js";

class MessageComponentHandler {
	static createRow = components => {
		return {
			type: Discord.ComponentType.ActionRow,
			components: components
		};
	};
	static createSelect = (valueLabelPairs, customId) => {
		return {
			type: Discord.ComponentType.SelectMenu,
			options: valueLabelPairs,
			custom_id: customId
		};
	};
	static createLinkButton = (label, url) => {
		return {
			type: Discord.ComponentType.Button,
			style: Discord.ButtonStyle.Link,
			label: label,
			url: url
		};
	};
	static createTestButton = () => {
		return {
			type: Discord.ComponentType.Button,
			style: Discord.ButtonStyle.Primary,
			label: "toto",
			custom_id: "toto"
		};
	};
	constructor(commandHandler) {
		this.commandHandler = commandHandler;
	};
	createRowWithSelectComponents = (selectOptions, selectedOption, customId) => {
		selectOptions.forEach(selectOption => selectOption.default = selectOption.value === selectedOption);
		return [MessageComponentHandler.createRow([
			MessageComponentHandler.createSelect(selectOptions, customId)
		])];
	};
};

export {MessageComponentHandler};
