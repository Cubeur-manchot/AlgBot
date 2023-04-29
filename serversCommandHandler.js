"use strict";

class ServersCommandHandler {
	static serversCommandEmbedTitle = {
		english: "Servers",
		french: "Serveurs"
	};
	static serversCommandEmbedDescription = {
		english: "Here is the list of Discord servers I am on",
		french: "Voici la liste des serveurs Discord sur lesquels je suis"
	};
	static membersWord = {
		english: "members",
		french: "membres"
	};
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.embedColor = embedColor;
		let language = this.commandHandler.messageHandler.algBot.language;
		this.serversCommandEmbedTitle = ServersCommandHandler.serversCommandEmbedTitle[language];
		this.serversCommandEmbedDescription = ServersCommandHandler.serversCommandEmbedDescription[language];
		this.membersWord = ServersCommandHandler.membersWord[language];
	};
	getServersCommandResult = () => {
		return {
			message: {
				textContent: null,
				embed: this.buildServersCommandEmbed(),
				components: null
			},
			error: false
		};
	};
	buildServersCommandEmbed = () => {
		let guildsList = [...this.commandHandler.messageHandler.algBot.discordClient.guilds.cache.values()]
			.map(guild => { return {name: guild.name, memberCount: guild.memberCount}})
			.sort((firstGuild, secondGuild) => secondGuild.memberCount - firstGuild.memberCount)
			.map(guild => `${guild.name} (${guild.memberCount} ${this.membersWord})`)
			.join("\n");
		return {
			color: this.embedColor,
			title: this.serversCommandEmbedTitle,
			description: `${this.serversCommandEmbedDescription} :\n\n${guildsList}`
		};
	};
};

export {ServersCommandHandler};
