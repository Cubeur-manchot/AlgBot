"use strict";

import {DiscordMessageEmbedBuilder} from "./discordUtils/discordMessageEmbedBuilder.js";

class InviteCommandHandler {
	static inviteCommandEmbedTitle = {
		english: "Invite AlgBot to a server",
		french: "Inviter AlgBot sur un serveur"
	};
	static inviteCommandEmbedDescription = {
		english: "Which instance of AlgBot to invite ?",
		french: "Quelle instance d'AlgBot inviter ?"
	};
	static algBotUsers = [
		{languageIsoCode: "gb", id: "716637227068948490", inviteLinkLabel: "Invite link"},
		{languageIsoCode: "fr", id: "705049733126946836", inviteLinkLabel: "Lien d'invitation"}
	];
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.embedColor = embedColor;
		let language = this.commandHandler.messageHandler.algBot.language;
		this.inviteCommandEmbedTitle = InviteCommandHandler.inviteCommandEmbedTitle[language];
		this.inviteCommandEmbedDescription = InviteCommandHandler.inviteCommandEmbedDescription[language];
	};
	getInviteCommandResult = () => {
		return {
			message: {
				embed: this.buildInviteCommandEmbed()
			},
			error: false
		};
	};
	buildInviteCommandEmbed = () => {
		let currentAlgBotUserId = this.commandHandler.messageHandler.algBot.discordClient.user.id;
		let inviteLinks = InviteCommandHandler.algBotUsers
			.sort((firstAlgBotUser, secondAlgBotUser) =>
				Math.abs(firstAlgBotUser.id - currentAlgBotUserId) - Math.abs(secondAlgBotUser.id - currentAlgBotUserId)) // current version will appear first
			.map(this.buildInviteLink)
			.join("\n\n");
		return DiscordMessageEmbedBuilder.createEmbed(
			this.embedColor,
			this.inviteCommandEmbedTitle,
			DiscordMessageEmbedBuilder.noTitleUrl,
			`${this.inviteCommandEmbedDescription}\n\n${inviteLinks}`,
			DiscordMessageEmbedBuilder.noFields,
			DiscordMessageEmbedBuilder.noThumbnailUrl,
			DiscordMessageEmbedBuilder.noImageUrl,
			DiscordMessageEmbedBuilder.noFooterTextContent
		);
	};
	buildInviteLink = algBotUser => {
		return ":flag_" + algBotUser.languageIsoCode + ": - "
			+ "[" + algBotUser.inviteLinkLabel + "]"
			+ "(https://discord.com/api/oauth2/authorize?client_id=" + algBotUser.id + "&permissions=388160&scope=bot)";
	};
};

export {InviteCommandHandler};
