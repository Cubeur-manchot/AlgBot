"use strict";

import {AlgManipulator} from "./algManipulator.js";
import {DiscordClient} from "./discordClient.js";
import {ImageBuilder} from "./imageBuilder.js";
import {Logger} from "./logger.js";
import {MessageHandler} from "./messageHandler.js";

class AlgBot {
	constructor(language, prefix) {
		this.language = language;
		this.prefix = prefix;
		this.logger = new Logger(this);
		this.messageHandler = new MessageHandler(this);
		this.discordClient = new DiscordClient(this);
		this.algManipulator = new AlgManipulator(this);
		this.imageBuilder = new ImageBuilder(this);
	};
};

export {AlgBot};
