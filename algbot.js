"use strict";

const {DiscordClient} = require("./discordClient.js");
const {AlgManipulator} = require("./algManipulator.js");
const {ImageBuilder} = require("./imageBuilder.js");
const {MessageHandler} = require("./messageHandlerNew.js");

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

module.exports = {AlgBot};
