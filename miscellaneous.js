"use strict";

const onReady = (AlgBot) => {
	AlgBot.user.setActivity("attendre d'afficher des algos")
		.then(console.log("Algbot is ready !"))
		.catch(console.error);
};

module.exports = {onReady};