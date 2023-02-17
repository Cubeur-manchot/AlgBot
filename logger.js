"use strict";

import {AlgBotDate} from "./date.js";

class Logger {
	constructor(algBot) {
		this.algBot = algBot;
	};
	infoLog = infoMessage => {
		console.log(`${this.getTimeStamp()}[Info] ${infoMessage}`);
	};
	errorLog = errorMessage => {
		console.error(`${this.getTimeStamp()}[Error] ${errorMessage}`);
	};
	getTimeStamp = () => {
		return `[${new AlgBotDate().getDateString()}]`;
	};
};

export {Logger};