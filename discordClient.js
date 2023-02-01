"use strict";

import Discord from "discord.js";

class DiscordClient extends Discord.Client {
	constructor(algBot) {
		super({intents: [
			Discord.GatewayIntentBits.GuildMessages, // messages in servers
			Discord.GatewayIntentBits.GuildMessageReactions, // reactions to messages in servers
			Discord.GatewayIntentBits.DirectMessages, // direct messages
			Discord.GatewayIntentBits.DirectMessageReactions, // reactions to direct messages
			Discord.GatewayIntentBits.MessageContent // message content
		]});
		this.algBot = algBot;
		this.on("message", this.algBot.messageHandler.onMessage);
		let language = this.algBot.language;
		this.login(process.env[`TOKEN_${language.toUpperCase()}`])
			.then(() => this.algBot.logger.infoLog(`AlgBot (${language}) is logged in !`))
			.catch(() => this.algBot.logger.errorLog(`Fail to login for AlgBot (${language}).`));
	};
	sendTextMessage = (textMessageContent, channel) => {
		channel.send(textMessageContent)
			.catch(error => this.algBot.logger.errorLog("Error when sending message "
				+ `(content = "${textMessageContent}"`
				+ `, at "${new AlgBotDate().getDateString()}"`
				+ `, channelName = "${channel.name}"`
				+ `, serverName = "${channel.guild.name}")`
				+ ` : "${error}".`
			));
	};
	deleteMessage = message => {
		if (message && !message.deleted) {
			message.delete()
				.catch(error => this.algBot.logger.errorLog("Error when deleting message "
					+ `(id = ${message.id}`
					+ `, content = "${message.content}"`
					+ `, created at "${new AlgBotDate(message.createdTimestamp).getDateString()}")`
					+ `, userId = ${message.author.id}`
					+ `, channelName = "${message.channel.name}"`
					+ `, serverName = "${message.channel.guild.name}")`
					+ ` : "${error}".`
				));
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

class AlgBotDate extends Date {
	constructor(timestamp) {
		super(timestamp);
	};
	getDateString = () =>
		`${this.getYearString()}-${this.getMonthString()}-${this.getDayString()} `
		+ `${this.getHoursString()}:${this.getMinutesString()}:${this.getSecondsString()}`;
	getStringTwoDigits = value => `${value < 10 ? "0" : ""}${value}`;
	getYearString = () => `${this.getFullYear()}`;
	getMonthString = () => this.getStringTwoDigits(this.getMonth() + 1);
	getDayString = () => this.getStringTwoDigits(this.getDate());
	getHoursString = () => this.getStringTwoDigits(this.getHours());
	getMinutesString = () => this.getStringTwoDigits(this.getMinutes());
	getSecondsString = () => this.getStringTwoDigits(this.getSeconds());
};

export {DiscordClient};
