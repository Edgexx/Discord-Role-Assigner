const bot = require('../bot.js');

module.exports = {
	name: 'role-msg',
	description: 'Post the role assignment message.',
	execute(message, args) {
		message.channel.send(bot.combineStrings(args));
		bot.updateAssignmentMessage(message);
	},
};
