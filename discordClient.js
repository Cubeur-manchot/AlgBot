"use strict";

import Discord from "discord.js";

class DiscordClient {
	constructor(algBot) {
		this.algBot = algBot;
		this.client = new Discord.Client();
		this.login();
	};
	login = () => {
		let language = this.algBot.language;
		this.client.login(process.env[`TOKEN_${language.toUpperCase()}`])
			.then(() => console.log(`AlgBot (${language}) is logged in !`))
			.catch(() => console.error(`Login error with AlgBot (${language}).`));
	};
};

export {DiscordClient};
