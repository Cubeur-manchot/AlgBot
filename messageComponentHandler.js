"use strict";

import Discord from "discord.js";

class MessageComponentHandler {
	static createRowWithSelectComponents = (selectOptions, selectedOption, customId) => {
		selectOptions.forEach(selectOption => selectOption.default = selectOption.value === selectedOption);
		return [new Discord.ActionRowBuilder()
			.setComponents([
				new Discord.StringSelectMenuBuilder()
					.setOptions(selectOptions)
					.setCustomId(customId)
			])
		];
	};
	static createRowWithButtonsComponents = buttons => {
		return [new Discord.ActionRowBuilder()
			.setComponents(buttons.map(button => new Discord.ButtonBuilder()
				.setStyle(Discord.ButtonStyle.Secondary)
				.setLabel(button.label)
				.setEmoji(button.emoji)
				.setCustomId(button.customId))
			)
		];
	};
	constructor(commandHandler) {
		this.commandHandler = commandHandler;
	};
};

export {MessageComponentHandler};
