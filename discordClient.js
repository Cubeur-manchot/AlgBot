"use strict";

import Discord from "discord.js";

class DiscordClient extends Discord.Client {
	constructor(algBot) {
		super();
		this.algBot = algBot;
		this.on("message", this.algBot.messageHandler.onMessage);
		let language = this.algBot.language;
		this.login(process.env[`TOKEN_${language.toUpperCase()}`])
			.then(() => this.algBot.logger.infoLog(`AlgBot (${language}) is logged in !`))
			.catch(() => this.algBot.logger.errorLog(`Login error with AlgBot (${language}).`));
	};
	deleteMessage = message => {
		if (message && !message.deleted) {
			message.delete()
				.catch(error => this.algBot.logger.errorLog(error));
		}
	};
	deleteMessageAfterSomeSecondsIfNotModified = message => {
		let currentLastUpdateTimeStamp = message.edits.length === 1 ? message.createdTimestamp : message.editedTimestamp;
		setTimeout(() => {
			if (message.editedTimestamp <= currentLastUpdateTimeStamp) {
				this.deleteMessage(message);
			}
		}, 10000);
	};
};

export {DiscordClient};
