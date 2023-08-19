"use strict";

import {DiscordClient} from "./discordUtils/discordClient.js";
import {Logger} from "./logger.js";
import {MessageHandler} from "./messageHandler.js";

const prefix = process.env["PREFIX"];

class AlgBot {
	constructor(language) {
		this.language = language;
		this.prefix = prefix;
		this.logger = new Logger(this);
		this.messageHandler = new MessageHandler(this);
		this.discordClient = new DiscordClient(this);
	};
};

export {AlgBot};
