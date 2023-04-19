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
	static commandErrorFeedbackModalTitle = {
		english: "Report of an error",
		french: "Rapport d'une erreur"
	};
	static commandErrorFeedbackModalCustomId = "commandErrorFeedbackModalCustomId";
	static commandErrorFeedbackModalCommandInputLabel = {
		english: "Example of command causing the error",
		french: "Exemple de commande provoquant l'erreur"
	};
	static commandErrorFeedbackModalCommandInputCustomId = "commandErrorFeedbackModalCommandInputCustomId";
	static commandErrorFeedbackModalShortDescriptionLabel = {
		english: "Short description of the error",
		french: "Description courte de l'erreur"
	};
	static commandErrorFeedbackModalShortDescriptionCustomId = "commandErrorFeedbackModalShortDescriptionCustomId";
	static commandErrorFeedbackModalLongDescriptionLabel = {
		english: "Detailed description of the error",
		french: "Description détaillée de l'erreur"
	};
	static commandErrorFeedbackModalLongDescriptionCustomId = "commandErrorFeedbackModalLongDescriptionCustomId";
	static otherFeedbackModalTitle = {
		english: "Feedback",
		french: "Feedback"
	};
	static otherFeedbackModalCustomId = "otherFeedbackModalCustomId";
	static otherFeedbackModalDescriptionLabel = {
		english: "Description",
		french: "Description"
	};
	static otherFeedbackModalDescriptionPlaceholder = {
		english: "Questions, new features suggestions, dissatisfactions, thanks, ...",
		french: "Questions, propositions de nouvelles fonctionnalités, mécontentements, remerciements, ..."
	};
	static otherFeedbackModalDescriptionCustomId = "otherFeedbackModalDescriptionCustomId";
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
		]);
		this.commandErrorFeedbackModalTitle = FeedbackCommandHandler.commandErrorFeedbackModalTitle[language];
		this.commandErrorFeedbackModalCommandInputLabel = FeedbackCommandHandler.commandErrorFeedbackModalCommandInputLabel[language];
		this.commandErrorFeedbackModalShortDescriptionLabel = FeedbackCommandHandler.commandErrorFeedbackModalShortDescriptionLabel[language];
		this.commandErrorFeedbackModalLongDescriptionLabel = FeedbackCommandHandler.commandErrorFeedbackModalLongDescriptionLabel[language];
		this.commandErrorFeedbackModal = MessageComponentHandler.createFormModal(
			[{
				label: this.commandErrorFeedbackModalCommandInputLabel,
				isMultiLine: false,
				isRequired: false,
				value: "",
				placeholder: "",
				customId: FeedbackCommandHandler.commandErrorFeedbackModalCommandInputCustomId
			}, {
				label: this.commandErrorFeedbackModalShortDescriptionLabel,
				isMultiLine: false,
				isRequired: true,
				value: "",
				placeholder: "",
				customId: FeedbackCommandHandler.commandErrorFeedbackModalShortDescriptionCustomId
			}, {
				label: this.commandErrorFeedbackModalLongDescriptionLabel,
				isMultiLine: true,
				isRequired: false,
				value: "",
				placeholder: "",
				customId: FeedbackCommandHandler.commandErrorFeedbackModalLongDescriptionCustomId
			}],
			this.commandErrorFeedbackModalTitle,
			FeedbackCommandHandler.commandErrorFeedbackModalCustomId
		);
		this.otherFeedbackModalTitle = FeedbackCommandHandler.otherFeedbackModalTitle[language];
		this.otherFeedbackModalDescriptionLabel = FeedbackCommandHandler.otherFeedbackModalDescriptionLabel[language];
		this.otherFeedbackModalDescriptionPlaceholder = FeedbackCommandHandler.otherFeedbackModalDescriptionPlaceholder[language];
		this.otherFeedbackModal = MessageComponentHandler.createFormModal(
			[{
				label: this.otherFeedbackModalDescriptionLabel,
				isMultiLine: true,
				isRequired: true,
				value: "",
				placeholder: this.otherFeedbackModalDescriptionPlaceholder,
				customId: FeedbackCommandHandler.otherFeedbackModalDescriptionCustomId
			}],
			this.otherFeedbackModalTitle,
			FeedbackCommandHandler.otherFeedbackModalCustomId
		);
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
	handleCommandErrorFeedbackButtonInteraction = interaction => {
		interaction.showModal(this.commandErrorFeedbackModal);
	};
	handleOtherFeedbackButtonInteraction = interaction => {
		interaction.showModal(this.otherFeedbackModal);
	};
};

export {FeedbackCommandHandler};
