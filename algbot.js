"use strict";

import {DiscordClient} from "./discordClient.js";
import {AlgManipulator} from "./algManipulator.js";
import {ImageBuilder} from "./imageBuilder.js";
import {MessageHandler} from "./messageHandler.js";

class AlgBot {
	constructor(language, prefix) {
		this.language = language;
		this.prefix = prefix;
		this.messageHandler = new MessageHandler(this);
		this.discordClient = new DiscordClient(this);
		this.algManipulator = new AlgManipulator(this);
		this.imageBuilder = new ImageBuilder(this);
	};
};

export {AlgBot};
