const bot = require('../bot.js');

module.exports = {
	name: 'refresh-msg',
	description: 'Forces and update/refesh to the main role assignment message.',
	execute(message, args) {
		bot.updateAssignmentMessage(message);
	},
};
