const fs = require('fs');
const bot = require('../bot.js');

module.exports = {
    name: 'role-add',
    description: 'Maps a reaction to a role, and adds this to the configured assignment message/post.',
    execute(message, args) {

        // !role-set-post {message_id}
        // !role-add {reaction} {role_name}
        // !role-remove {role_name}

        // check if user has permission to use this command
        if(!bot.doesUserHaveBotPermission(message)){
            message.reply('Nice try asshole.. You don\'t have permission to use me!.. :x:');
            return;
        }

        if(args.length < 2){
            message.reply('Insufficient argments.. :x: ```!role-add {reaction} {role_name}```');
            return;
        }

        const config = require('../config.json');
        var roles = require('../roles.json');
        const assignmentMessage = config.assignmentMessage;
        const reaction = args[0];
        var roleName = args[1];

        // Check if the main role assignment message exists
        if(!bot.doesAssigmentPostExist(message, assignmentMessage)){
            message.reply('Cannot find main message for role assignment.. :x:\nSet this up by using ```!role-set-post {message_id}```');
            return;
        }

        // Handling for role names with spaces
        if(args.length > 2){
            var strings = args;
            strings.shift();
            roleName = bot.combineStrings(strings);
        }

        roleName = roleName.toLowerCase();

        // Check if role exists in server
        if(!bot.doesRoleExist(message, roleName)){
            message.reply(`Role **${roleName}** does not exist.. :x:`);
            return;
        }

        // TODO: check if reaction is a valid content

        // check if role is already mapped in roles.JSON
        if(roles.hasOwnProperty(roleName)){
            message.reply('This role is already added to the role assignment post.. :x:');
            return;
        }

        // check if a reaction is already used
        for(const r in roles){
            if(roles[r] == reaction){
                message.reply(`Reaction: ${roles[r]} is already being used by **${r}** role.. :x:`);
                return;
            }
        }

        // Update the roles.json with the new role/reaction added.
        roles[roleName] = reaction;
        bot.updateRolesJSON(roles);
        message.reply(`Role **${roleName}** has been mapped to reaction -> ${reaction}.. :white_check_mark:`);

        // Edit the main role assignment message with the new roles.
        bot.updateAssignmentMessage(message);
    },
};
