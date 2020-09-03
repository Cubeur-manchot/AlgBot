"use strict";

const getGeneralHelpMessage = language => {
	if (language === "french") {
		return "Je suis un :robot: qui affiche des images de <:3x3solved:708049634349547531>\n"
			+ "\n`$alg` : affiche le cas que l'algo résout```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$do` : applique l'algo sur un cube résolu et affiche le résultat```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$help` : affiche cette aide```parser3\n$help```"
			+ "\n`$options` : affiche les options disponibles```parser3\n$options```"
			+ "\n`$alglist` : affiche les algos enregistrés, ainsi que comment les utiliser```parser3\n$alglist```"
			+ "\nSi on modifie/supprime la commande, j'adapte automatiquement ma réponse.\n"
			+ "\nSi une commande n'est pas bonne, j'envoie un message d'erreur dans le chan,"
			+ " et je supprime la commande au bout de 10 secondes pour faire le ménage.\n"
			+ "\nSi vous me trouvez un bug, merci d'envoyer un MP à Cubeur-manchot#7706 pour qu'il puisse me réparer :wrench:";
	} else { // english
		return "I'm a :robot: that displays <:3x3solved:708049634349547531> images\n"
			+ "\n`$alg` : displays the case that the alg solves```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$do` : applies the alg on a solved cube and displays the result```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
			+ "\n`$help` : displays this help```parser3\n$help```"
			+ "\n`$options` : displays the available options```parser3\n$options```"
			+ "\n`$alglist` : displays the registered algs, and how to use them```parser3\n$alglist```"
			+ "\nIf a command is edited/deleted, I'll automatically adapt my answer.\n"
			+ "\nIf a command is not correct, I'll send an error message,"
			+ " and I'll delete the command after 10 seconds to clean the chan.\n"
			+ "\nIf you find a bug, please send a PM to Cubeur-manchot#7706 so he can repair me :wrench:";
	}
};

module.exports = {getGeneralHelpMessage};
