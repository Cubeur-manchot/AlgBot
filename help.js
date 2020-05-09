"use strict";

const helpCommand = (message) => {
	let cubeEmoji = message.guild.emojis.cache.find(emoji => emoji.name === "3x3solved");
	message.channel.send(getHelpMessage(cubeEmoji))
		.catch(() => console.log("Impossible d'envoyer la réponse de $help"));
};

const getHelpMessage = (cubeEmoji) => {
	return `Je suis un :robot: pour afficher des images de <:${cubeEmoji.name}:${cubeEmoji.id}>\n`
		+ "\n`$alg` : affiche le cas que l'algo résout```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
		+ "\n`$do` : applique l'algo sur un cube résolu et affiche le résultat```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
		+ "\n`$help` : affiche cette aide```parser3\n$help```"
		+ "\n`$options` : affiche les options disponibles```parser3\n$options```"
		+ "\nPour rappel, les tests devront être faits dans #bots_poubelle pour ne pas polluer les autres chans.";
};

module.exports = {helpCommand};
