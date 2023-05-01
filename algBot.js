"use strict";

import {DiscordClient} from "./discordClient.js";
import {ImageBuilder} from "./imageBuilder.js";
import {Logger} from "./logger.js";
import {MessageHandler} from "./messageHandler.js";

const prefix = "$";

class AlgBot {
	constructor(language) {
		this.language = language;
		this.prefix = prefix;
		this.logger = new Logger(this);
		this.messageHandler = new MessageHandler(this);
		this.discordClient = new DiscordClient(this);
		this.imageBuilder = new ImageBuilder(this);
	};
};

export {AlgBot};
