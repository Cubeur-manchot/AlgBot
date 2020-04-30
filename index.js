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
	}
});

bot.login("NzA1MDQ5NzMzMTI2OTQ2ODM2.XqrfAA.QDRho-SdLkHy8lsjIRMJgszw5Uo");

function deleteMessageAfterSomeSeconds(message) {
	setTimeout(() => message.delete(), 10000);
}

function getInfoFromCommand(command) {
	let messageArray = command.split(" "),
		moveSequence = [], moveSequenceForImageUrl = [], imageUrl, puzzle, stage, caseOrAlg, colorScheme, unrecognizedOptions = [];
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
				|| reducedWord === "f2b" || reducedWord === "line") {
				stage = reducedWord;
			} else if (reducedWord === "ollcp") {
				stage = "coll";
			} else if (reducedWord === "zbll" || reducedWord === "1lll") {
				stage = "pll";
			} else if (reducedWord === "zbls") {
				stage = "vh";
			} else if (reducedWord === "yellow") {
				colorScheme = "yogwrb";
			} else {
				unrecognizedOptions.push(word);
			}
		} else { // normal move
			moveSequence.push(word);
			moveSequenceForImageUrl.push(word.replace("'", "%27"));
		}
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
		imageUrl = "http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150&view=plan&pzl=" + puzzle
			+ "&sch=" + colorScheme + "&stage=" + stage + "&" + caseOrAlg + "=" + moveSequenceForImageUrl.join("");
	}
	return {imageUrl: imageUrl, moveSequence: moveSequence, unrecognizedOptions: unrecognizedOptions};
}