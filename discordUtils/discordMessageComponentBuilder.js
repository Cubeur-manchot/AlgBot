"use strict";

import Discord from "discord.js";

class DiscordMessageComponentBuilder {
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
	static createRowsWithButtonsComponents = buttonsLists => {
		return buttonsLists.map(buttonsList => new Discord.ActionRowBuilder()
			.setComponents(buttonsList.map(button => new Discord.ButtonBuilder()
				.setStyle(Discord.ButtonStyle.Secondary)
				.setLabel(button.label)
				.setEmoji(button.emoji)
				.setCustomId(button.customId))
			)
		);
	};
	static createFormModal = (inputFields, title, customId) => {
		return new Discord.ModalBuilder()
			.setTitle(title)
			.setComponents(inputFields.map(inputField =>
				new Discord.ActionRowBuilder()
					.setComponents([
						new Discord.TextInputBuilder()
							.setLabel(inputField.label)
							.setStyle(inputField.isMultiLine ? Discord.TextInputStyle.Paragraph : Discord.TextInputStyle.Short)
							.setMaxLength(inputField.maxLength)
							.setRequired(inputField.isRequired ?? false)
							.setValue(inputField.value)
							.setPlaceholder(inputField.placeholder)
							.setCustomId(inputField.customId)
					])
			))
			.setCustomId(customId);
	};
};

export {DiscordMessageComponentBuilder};
