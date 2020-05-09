/* console commands :
- initialize npm : npm init
- install discord.js : npm install --save discord.js
- install pm2.js : npm install --save pm2
- install pm2-windows-startup : npm install --save pm2-windows-startup
- launch script : node index.js
*/

const Discord = require("discord.js");

const {getMoveSequenceFromAlgName} = require("./algs.js");
const {deleteMessage, deleteMessageAfterSomeSeconds} = require("./messageHandler.js");

const AlgBot = new Discord.Client();

AlgBot.on("ready", function() {
	AlgBot.user.setActivity("attendre d'afficher des algos")
		.catch(console.error);
});

AlgBot.on("message", function (message) {
	if (message.author.username === "AlgBot" &&
		(message.content.includes("Impossible de") || message.content.includes("Option(s) non reconnue(s)"))) {
		deleteMessageAfterSomeSeconds(message);
	}
	if (message.content.includes("!changeBotAvatar")) {
		AlgBot.user.setAvatar(message.content.split(" ")[1])
			.then(() => message.channel.send("Avatar modifié"))
			.catch((reason) => {
				message.channel.send(":construction: Impossible de modifier l'avatar :construction: \n" + reason.toString());
				deleteMessageAfterSomeSeconds(message);
			});
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
	} else if (message.content.startsWith("$delete")) {
		deletePreviousMessage(message);
		console.log("on va delete le précédent message");
	}
});

bot.login("NzA1MDQ5NzMzMTI2OTQ2ODM2.XqrfAA.QDRho-SdLkHy8lsjIRMJgszw5Uo");

function deletePreviousMessage(message) {
	let currentChannel = message.channel;
	let messages = currentChannel.messages.cache.array();
	let messageToDelete = messages.reverse().find(message => {
		return message.author.username === "AlgBot" && message.attachments.size !== 0; // message send by AlgBot and containing an image
	});
	if (messageToDelete !== undefined) {
		deleteMessage(messageToDelete);
	}
	deleteMessage(message);
}

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
		} else if (word.includes("_") || word.toLowerCase().includes("une")) { // alg insert (like PLL_F) or sune/antisune
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
