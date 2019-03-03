module.exports = {
    name: 'role',
    description: 'Creates a post listening for reactions which are mapped to roles.',
    execute(message, args) {

        var roleExists = false;
        var memberHasRole = false;
        var requestedRole = null;
        var assignerRole = null;
        var roleName = args[0];

        if(args.length > 1){
            roleName = "";
            for (var i = 0; i < args.length; i++) {
                roleName = i > 0 ? `${roleName} ${args[i]}` : `${args[i]}`;
            }
        }

        roleName = roleName.toLowerCase();

        for (const role of message.channel.guild.roles) {
            if(role[1].name.toLowerCase() == roleName){
                roleExists = true;
                requestedRole = role[1];
                continue;
            }

            if(role[1].name == "Role Assigner"){
                assignerRole = role[1];
                continue;
            }
        }

        if (!roleExists) {
            message.reply('This role doesn\'t exist! :x:');
            return;
        }

        for (const role of message.member.roles) {
            if(role[1].name.toLowerCase() == roleName){
                memberHasRole = true;
                message.reply('You already have this role, silly! :white_check_mark:');
                return;
            }
        }

        if (roleExists && !memberHasRole && requestedRole) {
            if (assignerRole.position > requestedRole.position) {
                message.member.addRole(requestedRole.id);
                message.reply(`**${requestedRole.name}** role has been granted. :white_check_mark:`);
            }else{
                message.reply('I am not worthy enough to assign you such role.. :x:');
            }
        }
    },
};
