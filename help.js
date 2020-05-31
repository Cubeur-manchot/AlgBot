"use strict";

const getGeneralHelpMessage = message => {
	return `Je suis un :robot: pour afficher des images de <:3x3solved:693841238461382739>\n`
		+ "\n`$alg` : affiche le cas que l'algo résout```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
		+ "\n`$do` : applique l'algo sur un cube résolu et affiche le résultat```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
		+ "\n`$help` : affiche cette aide```parser3\n$help```"
		+ "\n`$options` : affiche les options disponibles```parser3\n$options```"
		+ "\n`$alglist` : affiche les algos enregistrés, ainsi que comment les utiliser```parser3\n$alglist```"
		+ "\nSi on modifie/supprime la commande, j'adapte automatiquement ma réponse.\n"
		+ "\nSi une commande n'est pas bonne, j'envoie un message d'erreur dans le chan,"
		+ " et je supprime la commande au bout de 10 secondes pour faire le ménage.\"\n"
		+ "\nPour rappel, les tests devront être faits dans #bots_poubelle pour ne pas polluer les autres chans.";
};

module.exports = {getGeneralHelpMessage};
