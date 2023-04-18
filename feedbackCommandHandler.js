"use strict";

import { MessageComponentHandler } from "./messageComponentHandler.js";

class FeedbackCommandHandler {
	static selectFeedbackTypeQuestionLabel = {
		english: "Which type of feedback do you want to give ?",
		french: "Quel type de feedback voulez-vous donner ?"
	};
	static commandErrorFeedbackButtonLabel = {
		english: "Error",
		french: "Erreur"
	};
	static commandErrorFeedbackButtonCustomId = "commandErrorFeedbackButtonCustomId";
	static otherFeedbackButtonLabel = {
		english: "Other",
		french: "Autre"
	};
	static otherFeedbackButtonCustomId = "otherFeedbackButtonCustomId";
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.embedColor = embedColor;
		let language = this.commandHandler.messageHandler.algBot.language;
		this.selectFeedbackTypeQuestionLabel = FeedbackCommandHandler.selectFeedbackTypeQuestionLabel[language];
		this.commandErrorFeedbackButtonLabel = FeedbackCommandHandler.commandErrorFeedbackButtonLabel[language];
		this.otherFeedbackButtonLabel = FeedbackCommandHandler.otherFeedbackButtonLabel[language];
		this.feedbackCommandEmbed = {
			color: this.embedColor,
			title: "Feedback",
			description: this.selectFeedbackTypeQuestionLabel
		};
		this.feedbackButtonsComponents = MessageComponentHandler.createRowWithButtonsComponents([
			{
				label: this.commandErrorFeedbackButtonLabel,
				emoji: "🤒",
				customId: FeedbackCommandHandler.commandErrorFeedbackButtonCustomId
			},
			{
				label: this.otherFeedbackButtonLabel,
				emoji: "🗨️",
				customId: FeedbackCommandHandler.otherFeedbackButtonCustomId
			}
		])
	};
	getFeedbackCommandResult = () => {
		return {
			message: {
				textContent: null,
				embed: this.feedbackCommandEmbed,
				components: this.feedbackButtonsComponents
			},
			error: false
		};
	};
};

export {FeedbackCommandHandler};
