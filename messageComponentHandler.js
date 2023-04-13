"use strict";

import Discord from "discord.js";

class MessageComponentHandler {
	static createRow = components => {
		return {
			type: Discord.ComponentType.ActionRow,
			components: components
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
	static createRowWithSelectComponents = (selectOptions, selectedOption, customId) => {
		selectOptions.forEach(selectOption => selectOption.default = selectOption.value === selectedOption);
		return [MessageComponentHandler.createRow([
			new Discord.StringSelectMenuBuilder({options: selectOptions, customId: customId})
		])];
	};
	constructor(commandHandler) {
		this.commandHandler = commandHandler;
	};
};

export {MessageComponentHandler};
