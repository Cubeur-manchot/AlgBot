"use strict";

import Discord from "discord.js";
import {AlgBotDate} from "../date.js";

class DiscordClient extends Discord.Client {
	static discordApiUnknownMessageError = "DiscordAPIError[10008]: Unknown Message";
	static routineActivity = {
		english: "learning new algs",
		french: "apprendre de nouveaux algos"
	};
	constructor(algBot) {
		super({
			intents: [
				Discord.GatewayIntentBits.Guilds,
				Discord.GatewayIntentBits.GuildMembers,
				Discord.GatewayIntentBits.GuildMessages,
				Discord.GatewayIntentBits.GuildMessageReactions,
				Discord.GatewayIntentBits.DirectMessages,
				Discord.GatewayIntentBits.DirectMessageReactions,
				Discord.GatewayIntentBits.MessageContent
			],
			partials: [
				Discord.Partials.Channel
			]
		});
		this.algBot = algBot;
		this.routineActivity = DiscordClient.routineActivity[this.algBot.language];
		this.on(Discord.Events.ClientReady, this.onReady);
		this.on(Discord.Events.MessageCreate, this.algBot.messageHandler.onMessageCreate);
		this.on(Discord.Events.MessageDelete, this.algBot.messageHandler.onMessageDelete);
		this.on(Discord.Events.MessageUpdate, this.algBot.messageHandler.onMessageUpdate);
		this.on(Discord.Events.InteractionCreate, this.algBot.messageHandler.commandHandler.onInteractionCreate);
		this.loginWithToken();
	};
	sendMessageToChannel = (message, channel) => {
		channel.send({
			content: message.textContent,
			embeds: message.embed ? [message.embed] : null,
			files: message.attachment ? [message.attachment] : null,
			components: message.components,
			allowedMentions: {
				repliedUser: false
			}
		})
		.catch(messageSendError => this.algBot.logger.errorLog("Error when sending "
			+ `"${message.textContent ?? ""}" `
			+ `(embeds : ${message.embed ? 1 : 0}`
			+ `, files : ${message.attachment ? 1 : 0}`
			+ `, components : ${message.components?.length ?? 0})`
			+ ` in channel "${channel.name}" `
			+ `(channelId = ${channel.id}`
			+ `, serverName = ${channel.guild.name})`
			+ ` : "${messageSendError}".`
		));
	};
	replyMessage = (answer, initialMessage, deleteIfNotEdited) => {
		if (initialMessage && !initialMessage.deleted) {
			initialMessage.reply({
				content: answer.textContent,
				embeds: answer.embed ? [answer.embed] : null,
				files: answer.attachment ? [answer.attachment] : null,
				components: answer.components,
				allowedMentions: {
					repliedUser: false
				}
			})
			.then(answerMessage => {
				if (answer.reactions) {
					for (let reaction of answer.reactions) {
						answerMessage.react(reaction)
							.catch(messageReactError => this.algBot.logger.errorLog(
								`Error when reacting "${reaction}" to message `
								+ `(content = "${answerMessage.content}"`
								+ `, embeds : ${answerMessage.embeds?.length ?? 0}`
								+ `, files : ${answerMessage.files?.length ?? 0}`
								+ `, components : ${answerMessage.components?.length ?? 0}`
								+ `, created at "${new AlgBotDate(answerMessage.createdTimestamp).getDateString()}"`
								+ `, userId = ${answerMessage.author.id}`
								+ `, channelName = ${answerMessage.channel.name ? `"${answerMessage.channel.name}"` : undefined}`
								+ `, serverName = ${answerMessage.channel.guild ? `"${answerMessage.channel.guild.name}"` : undefined})`
								+ ` : "${messageReactError}".`
							));
					}
				}
				if (deleteIfNotEdited && !this.channelIsDm(initialMessage.channel)) {
					this.deleteMessageAfterSomeSecondsIfNotModified(initialMessage);
				}
			})
			.catch(messageReplyError => this.algBot.logger.errorLog("Error when replying "
				+ `"${answer.textContent ?? ""}" `
				+ `(embeds : ${answer.embed ? 1 : 0}`
				+ `, files : ${answer.file ? 1 : 0}`
				+ `, components : ${answer.components?.length ?? 0})`
				+ " to initial message "
				+ `(content = "${initialMessage.content}"`
				+ `, embeds : ${initialMessage.embeds?.length ?? 0}`
				+ `, files : ${initialMessage.files?.length ?? 0}`
				+ `, components : ${initialMessage.components?.length ?? 0}`
				+ `, created at "${new AlgBotDate(initialMessage.createdTimestamp).getDateString()}"`
				+ `, userId = ${initialMessage.author.id}`
				+ `, channelName = ${initialMessage.channel.name ? `"${initialMessage.channel.name}"` : undefined}`
				+ `, serverName = ${initialMessage.channel.guild ? `"${initialMessage.channel.guild.name}"` : undefined})`
				+ ` : "${messageReplyError}".`
			));
		}
	};
	replyInteraction = (answer, interaction, deleteAfterSomeSeconds) => {
		interaction.reply({
			content: answer.textContent,
			embeds: answer.embed ? [answer.embed] : null,
			files: answer.attachment ? [answer.attachment] : null,
			components: answer.components,
			allowedMentions: {
				repliedUser: false
			},
			ephemeral: answer.ephemeral
		})
		.then(interactionAnswerMessage => {
			if (deleteAfterSomeSeconds) {
				this.deleteMessageAfterSomeSeconds(interactionAnswerMessage);
			}
		})
		.catch(interactionReplyError => this.algBot.logger.errorLog("Error when replying "
			+ `"${answer.textContent ?? ""}" `
			+ `(embeds : ${answer.embed ? 1 : 0}`
			+ `, files : ${answer.attachment ? 1 : 0}`
			+ `, components : ${answer.components?.length ?? 0})`
			+ " to interaction "
			+ `(type = "${Discord.InteractionType[interaction.type]}"`
			+ `, created at "${new AlgBotDate(interaction.createdTimestamp).getDateString()}"`
			+ `, userId = ${interaction.user.id}`
			+ `, channelName = ${interaction.channel.name ? `"${interaction.channel.name}"` : undefined}`
			+ `, serverName = ${interaction.channel.guild ? `"${interaction.channel.guild.name}"` : undefined})`
			+ ` : "${interactionReplyError}".`
		));
	};
	editMessage = (oldMessage, newMessage, deleteIfNotEdited, answeredMessageToDeleteIfNotEdited) => {
		if (oldMessage && !oldMessage.deleted) {
			oldMessage.edit({
				content: newMessage.textContent,
				embeds: newMessage.embed ? [newMessage.embed] : [],
				files: newMessage.attachment ? [newMessage.attachment] : [],
				components: newMessage.components ?? [],
				allowedMentions: {
					repliedUser: false
				}
			})
			.then(editedMessage => {
				if (newMessage.reactions) {
					for (let reaction of newMessage.reactions) {
						editedMessage.react(reaction)
							.catch(messageReactError => this.algBot.logger.errorLog(
								`Error when reacting "${reaction}" to message `
								+ `(content = "${editedMessage.content}"`
								+ `, embeds : ${editedMessage.embeds?.length ?? 0}`
								+ `, files : ${editedMessage.files?.length ?? 0}`
								+ `, components : ${editedMessage.components?.length ?? 0}`
								+ `, created at "${new AlgBotDate(editedMessage.createdTimestamp).getDateString()}"`
								+ `, userId = ${editedMessage.author.id}`
								+ `, channelName = ${editedMessage.channel.name ? `"${editedMessage.channel.name}"` : undefined}`
								+ `, serverName = ${editedMessage.channel.guild ? `"${editedMessage.channel.guild.name}"` : undefined})`
								+ ` : "${messageReactError}".`
							));
					}
				} else {
					editedMessage.reactions.removeAll()
						.catch(messageReactionRemoveError => this.algBot.logger.errorLog(
							"Error when removing all reactions of message "
							+ `(content = "${editedMessage.content}"`
							+ `, embeds : ${editedMessage.embeds?.length ?? 0}`
							+ `, files : ${editedMessage.files?.length ?? 0}`
							+ `, components : ${editedMessage.components?.length ?? 0}`
							+ `, created at "${new AlgBotDate(editedMessage.createdTimestamp).getDateString()}"`
							+ `, userId = ${editedMessage.author.id}`
							+ `, channelName = ${editedMessage.channel.name ? `"${editedMessage.channel.name}"` : undefined}`
							+ `, serverName = ${editedMessage.channel.guild ? `"${editedMessage.channel.guild.name}"` : undefined})`
							+ ` : "${messageReactionRemoveError}".`
						));
				}
				if (deleteIfNotEdited && !this.channelIsDm(oldMessage.channel)) {
					this.deleteMessageAfterSomeSecondsIfNotModified(answeredMessageToDeleteIfNotEdited);
				}
			})
			.catch(messageEditError => this.algBot.logger.errorLog("Error when editing message from "
				+ `"${oldMessage.textContent ?? ""}" `
				+ `(embeds : ${oldMessage.embeds?.length ?? 0}`
				+ `, files : ${oldMessage.files?.length ?? 0}`
				+ `, components : ${oldMessage.components?.length ?? 0}`
				+ `, created at "${new AlgBotDate(oldMessage.createdTimestamp).getDateString()}"`
				+ `, userId = ${oldMessage.author.id}`
				+ `, channelName = ${oldMessage.channel.name ? `"${oldMessage.channel.name}"` : undefined}`
				+ `, serverName = ${oldMessage.channel.guild ? `"${oldMessage.channel.guild.name}"` : undefined})`
				+ " to "
				+ `"${newMessage.textContent ?? ""}" `
				+ `(embeds : ${newMessage.embed ? 1 : 0}`
				+ `, files : ${newMessage.attachment ? 1 : 0}`
				+ `, components : ${newMessage.components ? newMessage.components.length : "0"})`
				+ ` : "${messageEditError}".`
			));
		}
	};
	updateInteractionMessage = (interaction, newMessage) => {
		interaction.update({
			content: newMessage.textContent,
			embeds: newMessage.embed ? [newMessage.embed] : null,
			files: newMessage.attachment ? [newMessage.attachment] : null,
			components: newMessage.components
		})
		.catch(interactionCreateError => this.algBot.logger.errorLog(
			`Fail to update interaction message for AlgBot (${this.algBot.language}) : "${interactionCreateError}".`
		));
	};
	deleteMessage = message => {
		if (message) {
			message.delete()
				.catch(deleteMessageError => {
					if (deleteMessageError !== DiscordClient.discordApiUnknownMessageError) {
						this.algBot.logger.errorLog("Error when deleting message "
							+ `(content = "${message.content}"`
							+ `, embeds : ${message.embeds?.length ?? 0}`
							+ `, files : ${message.files?.length ?? 0}`
							+ `, components : ${message.components?.length ?? 0}`
							+ `, created at "${new AlgBotDate(message.createdTimestamp).getDateString()}"`
							+ `, userId = ${message.author.id}`
							+ `, channelName = ${message.channel.name ? `"${message.channel.name}"` : undefined}`
							+ `, serverName = ${message.channel.guild ? `"${message.channel.guild.name}"` : undefined})`
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
		}, 30000);
	};
	deleteMessageAfterSomeSeconds = message => {
		setTimeout(() => {
			this.deleteMessage(message);
		}, 10000);
	};
	loginWithToken = () => {
		this.login(process.env[`TOKEN_${this.algBot.language}`])
			.then(() => this.algBot.logger.infoLog(
				`AlgBot (${this.algBot.language}) is logged in !`
			))
			.catch(loginError => this.algBot.logger.errorLog(
				`Fail to login for AlgBot (${this.algBot.language}) : "${loginError}".`
			));
	};
	onReady = () => {
		this.algBot.logger.infoLog(`AlgBot (${this.algBot.language}) is ready !`);
		this.fetchFeedbackChannel();
		this.deployApplicationCommands();
		this.setRoutinePresence();
	};
	fetchFeedbackChannel = () => {
		this.channels.fetch(process.env[`FEEDBACKCHANNEL_${this.algBot.language}`])
			.then(channel => {
				this.algBot.messageHandler.commandHandler.feedbackCommandHandler.feedbackChannel = channel;
				this.algBot.logger.infoLog(
					`AlgBot (${this.algBot.language})'s feedback channel has been fetched !`
				);
			})
			.catch(channelFetchError => this.algBot.logger.errorLog(
				`Fail to fetch feedback channel for AlgBot (${this.algBot.language}) : "${channelFetchError}".`
			));
	};
	deployApplicationCommands = () => {
		let commands = this.algBot.messageHandler.commandHandler.buildApplicationCommands();
		this.rest.get(Discord.Routes.applicationCommands(this.application.id))
		.then(currentCommands => {
			if (this.algBot.messageHandler.commandHandler.areFullCommandsSetsEqual(currentCommands, commands)) {
				this.algBot.logger.infoLog(
					`AlgBot (${this.algBot.language})'s commands are up to date, no need to redeploy them.`
				);
			} else {
				this.algBot.logger.infoLog(
					`AlgBot (${this.algBot.language})'s commands are not up to date, and should be redeployed.`
				);
				this.deployCommands(commands);
			}
		})
		.catch(applicationCommandsGetError => {
			this.algBot.logger.warningLog(
				`Fail to get application commands for AlgBot (${this.algBot.language}) : "${applicationCommandsGetError}".`
			);
			this.deployCommands(commands);
		});
	};
	deployCommands = (commands) => {
		this.rest.put(
			Discord.Routes.applicationCommands(this.application.id),
			{body: commands.map(command => command.toJSON())}
		)
		.then(() => this.algBot.logger.infoLog(
			`AlgBot (${this.algBot.language})'s commands have been deployed !`
		))
		.catch(applicationCommandsPutError => this.algBot.logger.errorLog(
			`Fail to deploy application commands for AlgBot (${this.algBot.language}) : "${applicationCommandsPutError}".`
		));
	};
	setRoutinePresence = () => {
		this.user.setPresence({
			activities: [{name: this.routineActivity, type: Discord.ActivityType.Playing}],
			status: "online",
		});
		this.algBot.logger.infoLog(
			`AlgBot (${this.algBot.language})'s routine presence has been set.`
		);
	};
	channelIsDm = channel => {
		return channel.type === Discord.ChannelType.DM;
	};
	channelIsThread = channel => {
		return [Discord.ChannelType.PublicThread, Discord.ChannelType.PrivateThread].includes(channel.type);
	};
};

export {DiscordClient};
