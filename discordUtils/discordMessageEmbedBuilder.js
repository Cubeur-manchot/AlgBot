"use strict";

import Discord from "discord.js";

class DiscordMessageEmbedBuilder {
	static noTitleUrl = null;
	static noDescription = null;
	static noFields = null;
	static noThumbnailUrl = null;
	static noImageUrl = null;
	static noFooterTextContent = null;
	static embedSizeLimits = {
		title: 256,
		description: 4096
	};
	static createEmbed = (color, title, titleUrl, description, fields, thumbnailImageUrl, imageUrl, footerTextContent) => {
		// mandatory fields
		let embed = new Discord.EmbedBuilder()
			.setColor(color)
			.setTitle(DiscordMessageEmbedBuilder.applyTitleSizeLimit(title));
		// optional fields
		if (titleUrl !== DiscordMessageEmbedBuilder.noTitleUrl) {
			embed.setURL(titleUrl);
		}
		if (description !== DiscordMessageEmbedBuilder.noDescription) {
			embed.setDescription(DiscordMessageEmbedBuilder.applyDescriptionSizeLimit(description));
		}
		if (fields !== DiscordMessageEmbedBuilder.noFields) {
			embed.addFields(...fields);
		}
		if (thumbnailImageUrl !== DiscordMessageEmbedBuilder.noThumbnailUrl) {
			embed.setThumbnail(thumbnailImageUrl);
		}
		if (imageUrl !== DiscordMessageEmbedBuilder.noImageUrl) {
			embed.setImage(imageUrl);
		}
		if (footerTextContent !== DiscordMessageEmbedBuilder.noFooterTextContent) {
			embed.setFooter({text: footerTextContent});
		}
		return embed;
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
