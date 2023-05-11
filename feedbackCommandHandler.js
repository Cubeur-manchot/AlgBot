"use strict";

import {AlgBotDate} from "./date.js";
import {DiscordMessageComponentBuilder} from "./discordUtils/discordMessageComponentBuilder.js";

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
	static feedbackThankYouLabel = {
		english: "Thank you for your feedback !",
		french: "Merci pour votre feedback !"
	};
	constructor(commandHandler, embedColor) {
		this.commandHandler = commandHandler;
		this.embedColor = embedColor;
		let language = this.commandHandler.messageHandler.algBot.language;
		this.selectFeedbackTypeQuestionLabel = FeedbackCommandHandler.selectFeedbackTypeQuestionLabel[language];
		this.feedbackCommandEmbed = {
			color: this.embedColor,
			title: "Feedback",
			description: this.selectFeedbackTypeQuestionLabel
		};
		this.feedbackButtonsComponents = DiscordMessageComponentBuilder.createRowWithButtonsComponents([
			{
				label: FeedbackCommandHandler.commandErrorFeedbackButtonLabel[language],
				emoji: "🤒",
				customId: FeedbackCommandHandler.commandErrorFeedbackButtonCustomId
			},
			{
				label: FeedbackCommandHandler.otherFeedbackButtonLabel[language],
				emoji: "🗨️",
				customId: FeedbackCommandHandler.otherFeedbackButtonCustomId
			}
		]);
		this.commandErrorFeedbackModal = DiscordMessageComponentBuilder.createFormModal(
			[{
				label: FeedbackCommandHandler.commandErrorFeedbackModalCommandInputLabel[language],
				isMultiLine: false,
				isRequired: false,
				maxLength: 500,
				value: "",
				placeholder: "",
				customId: FeedbackCommandHandler.commandErrorFeedbackModalCommandInputCustomId
			}, {
				label: FeedbackCommandHandler.commandErrorFeedbackModalShortDescriptionLabel[language],
				isMultiLine: false,
				isRequired: true,
				maxLength: 120,
				value: "",
				placeholder: "",
				customId: FeedbackCommandHandler.commandErrorFeedbackModalShortDescriptionCustomId
			}, {
				label: FeedbackCommandHandler.commandErrorFeedbackModalLongDescriptionLabel[language],
				isMultiLine: true,
				isRequired: false,
				maxLength: 4000,
				value: "",
				placeholder: "",
				customId: FeedbackCommandHandler.commandErrorFeedbackModalLongDescriptionCustomId
			}],
			FeedbackCommandHandler.commandErrorFeedbackModalTitle[language],
			FeedbackCommandHandler.commandErrorFeedbackModalCustomId
		);
		this.otherFeedbackModal = DiscordMessageComponentBuilder.createFormModal(
			[{
				label: FeedbackCommandHandler.otherFeedbackModalDescriptionLabel[language],
				isMultiLine: true,
				isRequired: true,
				maxLength: 4000,
				value: "",
				placeholder: FeedbackCommandHandler.otherFeedbackModalDescriptionPlaceholder[language],
				customId: FeedbackCommandHandler.otherFeedbackModalDescriptionCustomId
			}],
			FeedbackCommandHandler.otherFeedbackModalTitle[language],
			FeedbackCommandHandler.otherFeedbackModalCustomId
		);
		this.feedbackThankYouLabel = FeedbackCommandHandler.feedbackThankYouLabel[language];
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
	handleCommandErrorFeedbackModalSubmit = interaction => {
		let [command, shortDescription, longDescription] = interaction.components
			.map(rowComponent => rowComponent.components[0].value);
		let pseudo = this.getPseudoFromInteraction(interaction);
		let date = new AlgBotDate().getDateString();
		let answerMessage = {
			textContent: null,
			embed: {
				color: this.embedColor,
				title: `__Error report__\n"${shortDescription}"`,
				thumbnail: {
					url: interaction.user.avatarURL()
				},
				description: longDescription.length ? `> ${longDescription}` : null,
				fields: command.length
					? [{name: "Command", value: command}]
					: null,
				footer: {
					text: `From ${pseudo}, at ${date}.`
				}
			},
			components: null
		};
		this.commandHandler.messageHandler.algBot.discordClient.sendMessageToChannel(answerMessage, this.feedbackChannel);
		this.replyFeedbackModalSubmitInteraction(interaction);
	};
	handleOtherFeedbackModalSubmit = interaction => {
		let description = interaction.components[0].components[0].value;
		let pseudo = this.getPseudoFromInteraction(interaction);
		let date = new AlgBotDate().getDateString();
		let answerMessage = {
			textContent: null,
			embed: {
				color: this.embedColor,
				title: "__Feedback report__",
				thumbnail: {
					url: interaction.user.avatarURL()
				},
				description: `> ${description}`,
				footer: {
					text: `From ${pseudo}, at ${date}.`
				}
			},
			components: null
		};
		this.commandHandler.messageHandler.algBot.discordClient.sendMessageToChannel(answerMessage, this.feedbackChannel);
		this.replyFeedbackModalSubmitInteraction(interaction);
	};
	getPseudoFromInteraction = interaction => {
		let userWithDiscriminator = `${interaction.user.username}#${interaction.user.discriminator}`;
		return interaction.member?.nickname
			? `${interaction.member.nickname} (${userWithDiscriminator})`
			: userWithDiscriminator;
	};
	replyFeedbackModalSubmitInteraction = interaction => {
		this.commandHandler.messageHandler.algBot.discordClient.replyInteraction({
			textContent: this.feedbackThankYouLabel,
			embed: null,
			components: null,
			ephemeral: true
		}, interaction);
	};
};

export {FeedbackCommandHandler};
