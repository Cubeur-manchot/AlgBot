"use strict";

class Logger {
	constructor(algBot) {
		this.algBot = algBot;
	};
	infoLog = infoMessage => {
		console.log(`[Info] ${infoMessage}`);
	};
	errorLog = errorMessage => {
		console.error(`[Error] ${errorMessage}`);
	};
};

export {Logger};