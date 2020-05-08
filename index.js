/* console commands :
- initializa npm : npm init
- install discord.js : npm install --save discord.js
- launch script : node index.js
*/

const Discord = require("discord.js");
const bot = new Discord.Client();

bot.on("ready", function() {
	bot.user.setActivity("attendre d'afficher des algos")
		.catch(console.error);
});

bot.on("message", function (message) {
	if (message.author.username === "AlgBot" &&
		(message.content.includes("Impossible de") || message.content.includes("Option(s) non reconnue(s)"))) {
		deleteMessageAfterSomeSeconds(message);
	}
	if (message.content.includes("!changeBotAvatar")) {
		bot.user.setAvatar(message.content.split(" ")[1])
			.then(() => message.channel.send("Avatar modifié"))
			.catch((reason) => {
				message.channel.send(":construction: Impossible de modifier l'avatar :construction: \n" + reason.toString());
				deleteMessageAfterSomeSeconds(message);
			});
	} else if (message.content === "ping") {
		message.channel.send("pong");
	} else if (message.content.startsWith("$alg") || message.content.startsWith("$do")) {
		let {imageUrl, moveSequence, unrecognizedOptions} = getInfoFromCommand(message.content);
		if (unrecognizedOptions.length === 0) {
			message.channel.send(moveSequence.join(" "), {files: [{attachment: imageUrl, name: "cubeImage.png"}]});
		} else {
			message.channel.send(":x: Option(s) non reconnue(s) :\n" + unrecognizedOptions.join("\n"));
			deleteMessageAfterSomeSeconds(message);
		}
	} else if (message.content === "$help") {
		message.channel.send(getHelpMessage());
	} else if (message.content === "$options") {
		message.channel.send(getOptionsHelpMessage());
	}
});

bot.login("NzA1MDQ5NzMzMTI2OTQ2ODM2.XqrfAA.QDRho-SdLkHy8lsjIRMJgszw5Uo");

function getOptionsHelpMessage() {
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
}

function getHelpMessage() {
	let cubeEmoji = bot.emojis.cache.find(emoji => emoji.name === "3x3solved");
	return `Je suis un :robot: pour afficher des images de <:${cubeEmoji.name}:${cubeEmoji.id}>\n`
		+ "\n`$alg` : affiche le cas que l'algo résout```parser3\n$alg r U R' F' R U R' U' R' F R2 U' r'```"
		+ "\n`$do` : applique l'algo sur un cube résolu et affiche le résultat```parser3\n$do r U R' F' R U R' U' R' F R2 U' r'```"
		+ "\n`$help` : affiche cette aide```parser3\n$help```"
		+ "\n`$options` : affiche les options disponibles```parser3\n$options```"
		+ "\nPour rappel, les tests devront être faits dans #bots_poubelle pour ne pas polluer les autres chans.";
}

function deleteMessageAfterSomeSeconds(message) {
	setTimeout(() => message.delete(), 10000);
}

function getInfoFromCommand(command) {
	let messageArray = command.split(" "),
		moveSequence = [], moveSequenceForImageUrl = [], imageUrl, puzzle, stage, caseOrAlg, colorScheme, unrecognizedOptions = [], view;
	if (messageArray[0] === "$do") {
		caseOrAlg = "alg";
	} else {
		caseOrAlg = "case";
	}
	for (let word of messageArray.slice(1)) {
		if (word.startsWith("-")) { // option
			let reducedWord = word.slice(1);
			if (/^\d+$/.test(reducedWord)) { // word is -number
				puzzle = reducedWord;
			} else if (reducedWord === "megaminx" || reducedWord === "kilominx") {
				puzzle = reducedWord.substring(0, 4);
			} else if (reducedWord === "mega" || reducedWord === "sq1" || reducedWord === "skewb" || reducedWord === "kilo") {
				puzzle = reducedWord;
			} else if (reducedWord === "skweb") {
				puzzle = "skewb";
			} else if (reducedWord === "fl" || reducedWord === "f2l" || reducedWord === "ll" || reducedWord === "cll"
				|| reducedWord === "ell" || reducedWord === "oll" || reducedWord === "ocll" || reducedWord === "oell"
				|| reducedWord === "coll" || reducedWord === "coell" || reducedWord === "wv" || reducedWord === "vh"
				|| reducedWord === "els" || reducedWord === "cls" || reducedWord === "cmll" || reducedWord === "cross"
				|| reducedWord === "f2l_3" || reducedWord === "f2l_2" || reducedWord === "f2l_sm" || reducedWord === "f2l_1"
				|| reducedWord === "f2b" || reducedWord === "line" || reducedWord === "2x2x2" || reducedWord === "2x2x3") {
				stage = reducedWord;
				if (view === undefined) { // sets view only if it's not already defined
					if (reducedWord === "ll" || reducedWord === "cll" || reducedWord === "ell" || reducedWord === "oll"
						|| reducedWord === "ocll" || reducedWord === "oell" || reducedWord === "coll" || reducedWord === "coell"
						|| reducedWord === "wv" || reducedWord === "cmll") {
						view = "&view=plan";
					} else {
						view = "";
					}
				}
			} else if (reducedWord === "ollcp") {
				stage = "coll";
				if (view === undefined) { // sets view only if it's not already defined
					view = "&view=plan";
				}
			} else if (reducedWord === "zbll" || reducedWord === "1lll") {
				stage = "pll";
				if (view === undefined) { // sets view only if it's not already defined
					view = "&view=plan";
				}
			} else if (reducedWord === "zbls") {
				stage = "vh";
				if (view === undefined) { // sets view only if it's not already defined
					view = "";
				}
			} else if (reducedWord === "yellow") {
				colorScheme = "yogwrb";
			} else if (reducedWord === "plan") { // overwrite view
				view = "&view=plan";
			} else if (reducedWord === "normal") { // overwrite view
				view = "";
			} else {
				unrecognizedOptions.push(word);
			}
		} else if (word.includes("_") || word.includes("une")) { // alg insert (like PLL_F) or sune/antisune
			for (let move of getMoveSequenceFromAlgName(word)) {
				moveSequence.push(move);
				moveSequenceForImageUrl.push(move.replace("'", "%27"));
			}
		} else { // normal move
			moveSequence.push(word);
			moveSequenceForImageUrl.push(word.replace("'", "%27"));
		}
	}
	if (view === undefined) {
		view = "&view=plan";
	}
	if (colorScheme === undefined) {
		colorScheme = "wrgyob";
	}
	if (puzzle === undefined) {
		puzzle = "3";
	}
	if (stage === undefined) {
		stage = "pll";
	}
	if (puzzle === "skewb") {
	} else if (puzzle === "mega") {
		imageUrl = "http://cubiclealgdbimagegen.azurewebsites.net/generator?puzzle=mega&alg=" + moveSequenceForImageUrl.join("");
	} else if (puzzle === "kilo") {
	} else if (puzzle === "sq1") {
	} else { // cube
		imageUrl = "http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150" + view + "&pzl=" + puzzle
			+ "&sch=" + colorScheme + "&stage=" + stage + "&" + caseOrAlg + "=" + moveSequenceForImageUrl.join("");
	}
	return {imageUrl: imageUrl, moveSequence: moveSequence, unrecognizedOptions: unrecognizedOptions};
}

function getMoveSequenceFromAlgName(algName) { // library of predefined alg sequences
	let moveSequence;
	switch(algName) {
		case "PLL_Aa": moveSequence = "l' U R' D2 R U' R' D2 R2 x'"; break;
		case "PLL_Ab": moveSequence = "l' R' D2 R U R' D2 R U' R x'"; break;
		case "PLL_E" : moveSequence = "x' R U' R' D R U R' D' R U R' D R U' R' D' x"; break;
		case "PLL_F" : moveSequence = "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"; break;
		case "PLL_Ga" : moveSequence = "R2 u R' U R' U' R u' R2' F' U F"; break;
		case "PLL_Gb" : moveSequence = "F' U' F R2 u R' U R U' R u' R2'"; break;
		case "PLL_Gc" : moveSequence = "R2' u' R U' R U R' u R2 f R' f'"; break;
		case "PLL_Gd" : moveSequence = "f R f' R2' u' R U' R' U R' u R2"; break;
		case "PLL_H" : moveSequence = "M2' U M2' U2 M2' U M2'"; break;
		case "PLL_Ja": moveSequence = "R' U L' U2 R U' R' U2 R L"; break;
		case "PLL_J": case "PLL_Jb": moveSequence = "R U R' F' R U R' U' R' F R2 U' R'"; break;
		case "PLL_Na": moveSequence = "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"; break;
		case "PLL_Nb": moveSequence = "R' U L' U2 R U' L R' U L' U2 R U' L"; break;
		case "PLL_Ra": moveSequence = "R U R' F' R U2 R' U2' R' F R U R U2' R'"; break;
		case "PLL_Rb": moveSequence = "R' U2 R U2 R' F R U R' U' R' F' R2"; break;
		case "PLL_T": moveSequence = "R U R' U' R' F R2 U' R' U' R U R' F'"; break;
		case "PLL_Ua": moveSequence = "R2 U' R' U' R U R U R U' R"; break;
		case "PLL_Ub": moveSequence = "R' U R' U' R' U' R' U R U R2"; break;
		case "PLL_V": moveSequence = "R' U R' d' R' F' R2 U' R' U R' F R F"; break;
		case "PLL_Y": moveSequence = "F R U' R' U' R U R' F' R U R' U' R' F R F'"; break;
		case "PLL_Z": moveSequence = "M2' U M2' U M' U2 M2' U2 M'"; break;
		case "sune": case "Sune": moveSequence = "R U R' U R U2' R'"; break;
		case "antisune": case "Antisune": moveSequence = "R U2 R' U' R U' R'"; break;
		default: moveSequence = ""; break;
	}
	return moveSequence.split(" ");
}
