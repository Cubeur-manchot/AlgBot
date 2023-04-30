"use strict";

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
				textContent: null,
				embed: this.buildInviteCommandEmbed(),
				components: null
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
		return {
			color: this.embedColor,
			title: this.inviteCommandEmbedTitle,
			description: `${this.inviteCommandEmbedDescription}\n\n${inviteLinks}`
		};
	};
	buildInviteLink = algBotUser => {
		return ":flag_" + algBotUser.languageIsoCode + ": - "
			+ "[" + algBotUser.inviteLinkLabel + "]"
			+ "(https://discord.com/api/oauth2/authorize?client_id=" + algBotUser.id + "&permissions=388160&scope=bot)";
	};
};

export {InviteCommandHandler};
