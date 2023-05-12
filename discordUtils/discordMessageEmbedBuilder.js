"use strict";

import Discord from "discord.js";

class DiscordMessageEmbedBuilder {
	static embedSizeLimits = {
		title: 256,
		description: 4096
	};
	static createSimpleEmbed = (color, title, description) => {
		return new Discord.EmbedBuilder()
			.setColor(color)
			.setTitle(DiscordMessageEmbedBuilder.applyTitleSizeLimit(title))
			.setDescription(DiscordMessageEmbedBuilder.applyDescriptionSizeLimit(description));
	};
	static createEmbedWithImageAndLink = (color, title, url, description, imageUrl) => {
		return DiscordMessageEmbedBuilder.createSimpleEmbed(color, title, description)
			.setURL(url)
			.setImage(imageUrl);
	};
	static applyTitleSizeLimit = title => {
		return DiscordMessageEmbedBuilder.applyEmbedSizeLimit(
			title, DiscordMessageEmbedBuilder.embedSizeLimits.title);
	};
	static applyDescriptionSizeLimit = description => {
		return DiscordMessageEmbedBuilder.applyEmbedSizeLimit(
			description, DiscordMessageEmbedBuilder.embedSizeLimits.description);
	};
	static applyEmbedSizeLimit = (fieldValue, discordLimit) => {
		return fieldValue.length <= discordLimit
			? fieldValue
			: `${fieldValue.substring(0, discordLimit - 3)}...`;
	};
};

export {DiscordMessageEmbedBuilder};
