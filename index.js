"use strict";

import {AlgBot} from "./algBot.js"

for (let language of process.env.LANGUAGES.split(",")) {
	new AlgBot(language);
}
