"use strict";

const optionsCommand = (message) => {
	message.channel.send(getOptionsHelpMessage())
		.catch(error => console.log(error));
};

const getOptionsHelpMessage = () => {
	return "Voici les options que je prends en charge :\n"
		+ "\n`-puzzle` permet d'afficher l'algo sur un puzzle autre que 3x3 :"
		+ "```yaml\n$alg Lw' U2 Lw' U2 F2 Lw' F2 Rw U2 Rw' U2' Lw2' -5```"
		+ "Puzzles valides : tous les cubes de 1 à 10.\n"
		+ "\n`-stage` masque certains stickers du cube pour faire apparaître une étape précise :"
		+ "```yaml\n$alg R' F R U R' U' F' U R -oll```"
		+ "Stages valides :\n"
		+ "`cll`, `cmll`, `coll`, `ell`, `ll`, `ocll`, `ocell`, `oell`, `oll`, `ollcp`, `wv`, `zbll`, `1LLL` (appliquent une vue \"plan\")\n"
		+ "`cls`, `cross`, `els`, `fl`, `f2b`, `f2l`, `f2l_1`, `f2l_2`, `f2l_sm`, `f2l_3`, `line`, `vh`, `zbls`, `2x2x2`, `2x2x3` (appliquent une vue \"normal\")\n"
		+ "\n`-view` permet de modifier la vue :"
		+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -normal```"
		+ "Vues valides : plan, normal.\n"
		+ "\n`-yellow` affiche le cube avec du jaune en haut à la place du blanc par défaut :"
		+ "```yaml\n$alg R U R' U' R' F R2 U' R' U' R U R' F' -yellow```"
		+ "\nLorsqu'une option n'est pas prise en charge, un message d'erreur est envoyé dans le chan,"
		+ " et la commande est supprimée au bout de 10 secondes pour faire le ménage."
};

module.exports = {optionsCommand};
