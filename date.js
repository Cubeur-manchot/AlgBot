"use strict";

class AlgBotDate extends Date {
	constructor(timestamp) {
		super();
		if (timestamp) {
			this.setTime(timestamp);
		}
	};
	getDateString = () =>
		`${this.getYearString()}-${this.getMonthString()}-${this.getDayString()} `
		+ `${this.getHoursString()}:${this.getMinutesString()}:${this.getSecondsString()}`;
	getStringTwoDigits = value => `${value < 10 ? "0" : ""}${value}`;
	getYearString = () => `${this.getFullYear()}`;
	getMonthString = () => this.getStringTwoDigits(this.getMonth() + 1);
	getDayString = () => this.getStringTwoDigits(this.getDate());
	getHoursString = () => this.getStringTwoDigits(this.getHours());
	getMinutesString = () => this.getStringTwoDigits(this.getMinutes());
	getSecondsString = () => this.getStringTwoDigits(this.getSeconds());
};

export {AlgBotDate};
