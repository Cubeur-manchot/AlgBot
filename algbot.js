"use strict";

import {DiscordClient} from "./discordClient.js";
import {AlgManipulator} from "./algManipulator.js";
import {ImageBuilder} from "./imageBuilder.js";
import {MessageHandler} from "./messageHandlerNew.js";

class AlgBot {
	constructor(language, prefix) {
		this.language = language;
		this.prefix = prefix;
		this.client = new DiscordClient(this);
		this.algManipulator = new AlgManipulator(this);
		this.imageBuilder = new ImageBuilder(this);
		this.messageHandler = new MessageHandler(this);
	};
};

export {AlgBot};
