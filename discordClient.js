"use strict";

import Discord from "discord.js";

class DiscordClient extends Discord.Client {
	constructor(algBot) {
		super({intents: [
			Discord.GatewayIntentBits.Guilds,
			Discord.GatewayIntentBits.GuildMembers,
			Discord.GatewayIntentBits.GuildMessages,
			Discord.GatewayIntentBits.GuildMessageReactions,
			Discord.GatewayIntentBits.DirectMessages,
			Discord.GatewayIntentBits.DirectMessageReactions,
			Discord.GatewayIntentBits.MessageContent
		]});
		this.algBot = algBot;
		this.on("ready", this.onReady);
		this.on("messageCreate", this.algBot.messageHandler.onMessageCreate);
		this.on("messageDelete", this.algBot.messageHandler.onMessageDelete);
		this.on("messageUpdate", this.algBot.messageHandler.onMessageUpdate);
		this.on("interactionCreate", this.algBot.messageHandler.onInteractionCreate);
		this.loginWithToken();
	};
	/*sendTextMessage = (textMessageContent, channel) => {
		channel.send({content: textMessageContent})
			.catch(error => this.algBot.logger.errorLog("Error when sending message "
				+ `(content = "${textMessageContent}"`
				+ `, at "${new AlgBotDate().getDateString()}"`
				+ `, channelName = "${channel.name}"`
				+ `, serverName = "${channel.guild.name}")`
				+ ` : "${error}".`
			));
	};*/
	reply = (answer, initialMessage, deleteIfNotEdited) => {
		if (initialMessage && !initialMessage.deleted) {
			initialMessage.reply({
				content: answer.textContent,
				embeds: answer.embed ? [answer.embed] : null,
				components: answer.components,
				allowedMentions: {
					repliedUser: false
				}
			})
			.then(() => {
				if (deleteIfNotEdited) {
					this.deleteMessageAfterSomeSecondsIfNotModified(initialMessage);
				}
			})
			.catch(messageReplyError => this.algBot.logger.errorLog("Error when replying "
				+ `"${answer.textContent ?? ""}" `
				+ `(embeds : ${answer.embed ? "1" : "0"}`
				+ `, components : ${answer.components?.length ?? 0})`
				+ " to initial message "
				+ `(content = "${initialMessage.content}"`
				+ `, embeds : ${initialMessage.embeds?.length ?? 0}`
				+ `, components : ${initialMessage.components?.length ?? 0}`
				+ `, created at "${new AlgBotDate(initialMessage.createdTimestamp).getDateString()}"`
				+ `, userId = ${initialMessage.author.id}`
				+ `, channelName = "${initialMessage.channel.name}"`
				+ `, serverName = "${initialMessage.channel.guild.name}")`
				+ ` : "${messageReplyError}".`
			));
		}
	};
	editMessage = (oldMessage, newMessage, deleteIfNotEdited, answeredMessageToDeleteIfNotEdited) => {
		if (oldMessage && !oldMessage.deleted) {
			oldMessage.edit({
				content: newMessage.textContent,
				embeds: newMessage.embed ? [newMessage.embed] : [],
				components: newMessage.components ?? [],
				allowedMentions: {
					repliedUser: false
				}
			})
			.then(() => {
				if (deleteIfNotEdited) {
					this.deleteMessageAfterSomeSecondsIfNotModified(answeredMessageToDeleteIfNotEdited);
				}
			})
			.catch(messageEditError => this.algBot.logger.errorLog("Error when editing message from "
				+ `"${oldMessage.textContent ?? ""}" `
				+ `(embeds : ${oldMessage.embeds??length ?? 0}`
				+ `, components : ${oldMessage.components?.length ?? 0}`
				+ `, created at "${new AlgBotDate(oldMessage.createdTimestamp).getDateString()}"`
				+ `, userId = ${oldMessage.author.id}`
				+ `, channelName = "${oldMessage.channel.name}"`
				+ `, serverName = "${oldMessage.channel.guild.name}")`
				+ " to "
				+ `"${newMessage.textContent ?? ""}" `
				+ `(embeds : ${newMessage.embed ? "1" : "0"}`
				+ `, components : ${newMessage.components ? newMessage.components.length : "0"})`
				+ ` : "${messageEditError}".`
			));
		}
	};
	deleteMessage = message => {
		if (message) {
			message.delete()
				.catch(deleteMessageError => {
					if (deleteMessageError !== "DiscordAPIError[10008]: Unknown Message") { // when the message was not already deleted
						this.algBot.logger.errorLog("Error when deleting message "
							+ `(content = "${message.content}"`
							+ `, embeds : ${message.embeds?.length ?? 0}`
							+ `, components : ${message.components?.length ?? 0}`
							+ `, created at "${new AlgBotDate(message.createdTimestamp).getDateString()}"`
							+ `, userId = ${message.author.id}`
							+ `, channelName = "${message.channel.name}"`
							+ `, serverName = "${message.channel.guild.name}")`
							+ ` : "${deleteMessageError}".`);
					}
				});
		}
	};
	deleteMessageAfterSomeSecondsIfNotModified = message => {
		let currentLastUpdateTimeStamp = message.editedTimestamp ?? message.createdTimestamp;
		setTimeout(() => {
			if (message.editedTimestamp <= currentLastUpdateTimeStamp) {
				this.deleteMessage(message);
			}
		}, 10000);
	};
	loginWithToken = () => {
		this.login(process.env[`TOKEN_${this.algBot.language.toUpperCase()}`])
			.then(() => this.algBot.logger.infoLog(`AlgBot (${this.algBot.language}) is logged in !`))
			.catch(loginError => this.algBot.logger.errorLog(
				`Fail to login for AlgBot (${this.algBot.language}) : "${loginError}".`
			));
	};
	onReady = () => {
		this.algBot.logger.infoLog(`AlgBot (${this.algBot.language}) is ready !`);
		this.user.setPresence({
			activities: [{name: this.getActivity(), type: Discord.ActivityType.Playing}],
			status: "online",
		});
		this.algBot.logger.infoLog(`AlgBot (${this.algBot.language})'s presence has been set.`);
	};
	getActivity = () => {
		switch (this.algBot.language) {
			case "french": return "apprendre de nouveaux algos";
			case "english": return "learning new algs";
		}
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
