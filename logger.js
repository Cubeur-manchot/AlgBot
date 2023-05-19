"use strict";

import {AlgBotDate} from "./date.js";

class Logger {
	constructor(algBot) {
		this.algBot = algBot;
	};
	infoLog = infoMessage => {
		console.log(`${this.getTimeStamp()}[Info] ${infoMessage}`);
	};
	warningLog = warningMessage => {
		console.warn(`${this.getTimeStamp()}[Warning] ${warningMessage}`);
	};
	errorLog = errorMessage => {
		console.error(`${this.getTimeStamp()}[Error] ${errorMessage}`);
	};
	getTimeStamp = () => {
		return `[${new AlgBotDate().getDateString()}]`;
	};
};

export {Logger};