const fs = require('fs');
const config = require('./config.json');

exports.combineStrings = function(strings){

    var output = "";

    for (var i = 0; i < strings.length; i++) {
        output = i > 0 ? `${output} ${strings[i]}` : `${strings[i]}`;
    }

    return output;
}

exports.doesRoleExist = function(message, roleName){

    roleName = roleName.toLowerCase();

    for (const role of message.channel.guild.roles) {

        if(role[1].name.toLowerCase() == roleName){
            return true;
        }
    }

    return false;
}

exports.getRole = function(message, roleName){

    roleName = roleName.toLowerCase();
    var requestedRole;

    for (const role of message.channel.guild.roles) {
        if(role[1].name.toLowerCase() == roleName){
            requestedRole = role[1];
        }
    }

    return requestedRole;
}

exports.doesUserHaveBotPermission = function(message){

    const assignerRole = this.getRole(message, "Role Assigner");
    const userRoles = message.member.roles;

    for(const role of userRoles ){
        if(role[1].position > assignerRole.position){
            return true;
        }
    }

    return false;
}

exports.removeNonexistingRoles = function(message){
    var rolesJSON = require('./roles.json');

    // Removes any roles in roles.json that the server does not have
    for(const r in rolesJSON){
        if(!this.doesRoleExist(message, r)){
            delete rolesJSON[r];
        }
    }

    this.updateRolesJSON(rolesJSON);
}

exports.updateRolesJSON = function(roles){
    fs.writeFileSync('./roles.json', JSON.stringify(roles), function(err){
        if(err) throw err;
    });
    console.log('Updated roles.json');
}

exports.doesAssigmentPostExist = async function(message, messageID){
    return await message.channel.fetchMessage(messageID)
        .then(response => {return response.content == null ? true : false;})
        .catch(error => {return false;});
}

exports.updateAssignmentMessage = function(message){
    if(this.doesAssigmentPostExist(message, config.assignmentMessage)){
        message.channel.fetchMessage(config.assignmentMessage)
            .then(msg => {
                var msgSplit = msg.content.split(/(\r\n|\r|\n)/);
                var updatedMsg = `${msgSplit[0]}\n`;
                this.removeNonexistingRoles(message);
                var roles = require('./roles.json');

                for(const r in roles){
                    updatedMsg = `${updatedMsg}\n${roles[r]} : ${r}`;
                }
                msg.edit(updatedMsg)
                .then(msg => {
                    const reactions = msg.reactions;

                    // Remove any reactions which are no-longer mapped to an existing role
                    var abandonedReactions = {};
                    for(const reaction of reactions){
                        var abandoned = true;
                        for(const role in roles){
                            if(roles[role] == reaction[1].emoji.name){
                                abandoned = false;
                                break;
                            }
                        }
                        if(abandoned){
                            reaction[1].remove();
                        }
                    }

                    // Find all roles which do not have at least 1 reaction on the message
                    for(const r in roles){
                        var missingAReaction = true;
                        for(const reaction of reactions){
                            if(roles[r] == reaction[1].emoji.name){
                                missingAReaction = false;
                                break;
                            }
                        }
                        if(missingAReaction){
                            msg.react(roles[r])
                              .then(console.log(`Adding missing reaction for ${r}..`))
                              .catch(console.error);
                        }
                    }
                })
                .catch(console.error);
            })
            .catch(console.error);
    }else{
        message.reply('Cannot edit the main role assignment message because it does not exist.. :x:')
    }
}

exports.addRoleToMember = function (member, emoji){
    var rolesJSON = require('./roles.json');
    var requestedRoleName = '';
    for(const r in rolesJSON){
        if(rolesJSON[r] == emoji){
            requestedRoleName = r;
            break;
        }
    }

    if(requestedRoleName == '') return;

    var requestedRole = null;
    var assignerRole = null;
    var roleExists = false;

    for (const role of member.guild.roles) {
        if(role[1].name.toLowerCase() == requestedRoleName){
            requestedRole = role[1];
            roleExists = true;
            continue;
        }

        if(role[1].name == "Role Assigner"){
            assignerRole = role[1];
            continue;
        }
    }

    if(!roleExists) return;

    // Check if the member already has this role..
    for (const role of member.roles) {
        if(role[1].name.toLowerCase() == requestedRole.name.toLowerCase()) return;
    }

    if (roleExists && requestedRole) {
        if (assignerRole.position > requestedRole.position) {
            member.addRole(requestedRole.id);
        }
    }

}

exports.removeRoleFromMember = function (member, emoji){
    var rolesJSON = require('./roles.json');
    var requestedRoleName = '';
    for(const r in rolesJSON){
        if(rolesJSON[r] == emoji){
            requestedRoleName = r;
            break;
        }
    }

    if(requestedRoleName == '') return;

    var requestedRole = null;
    var assignerRole = null;
    var roleExists = false;

    for (const role of member.guild.roles) {
        if(role[1].name.toLowerCase() == requestedRoleName){
            requestedRole = role[1];
            roleExists = true;
            continue;
        }

        if(role[1].name == "Role Assigner"){
            assignerRole = role[1];
            continue;
        }
    }

    if(!roleExists) return;

    var memberHasRole = false;
    // Check if the member already has this role..
    for (const role of member.roles) {
        if(role[1].name.toLowerCase() == requestedRole.name.toLowerCase()){
            memberHasRole = true;
        }
    }

    if (roleExists && memberHasRole && requestedRole) {
        if (assignerRole.position > requestedRole.position) {
            member.removeRole(requestedRole.id);
        }
    }

}
