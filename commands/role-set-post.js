const fs = require('fs');

module.exports = {
    name: 'role-set-post',
    description: 'Sets the message ID to listen for reactions.',
    execute(message, args) {

        // !role-set-post {message_id}
        // !role-add {role_name} {reaction}
        // !role-remove {role_name}

        const config = require('../config.json');
        config.assignmentMessage = args[0];

        fs.writeFileSync('config.json', JSON.stringify(config), function(err){
            if(err) throw err;
        });
        console.log('Updated config.json');

        message.reply(`Now listening for reactions on message ID: ${config.assignmentMessage}`);
    },
};
