"use strict";

const deleteMessage = message => {
	message.delete()
		.catch(error => console.log(error));
};

const deleteMessageAfterSomeSeconds = message => {
	setTimeout(() => message.delete(), 10000);
};

module.exports = {deleteMessage, deleteMessageAfterSomeSeconds};
