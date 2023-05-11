"use strict";

import Discord from "discord.js";

class DiscordMessageEmbedBuilder {
	static createSimpleEmbed = (color, title, description) => {
		return new Discord.EmbedBuilder()
			.setColor(color)
			.setTitle(title)
			.setDescription(description);
	};
};

export {DiscordMessageEmbedBuilder};
