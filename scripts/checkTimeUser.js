const GuildSettings = require('../models/GuildSettings')
const { PermissionsBitField } = require('discord.js')


// Get time management role
async function getClockUserRole(guild_id) {
    let role_id = 0
    GuildSettings.findOne({ guild_id: guild_id }, (err, settings) => {
        if (err) {
            console.log(err)
            interaction.reply('An error occured while trying to check clocked in members.')
            return;
        }
        role_id = settings.user_role             
    })

    return new Promise((resolve) => {
        setTimeout(() => resolve(role_id), 300)
    })
}

async function checkTimeUser(interaction) {     
    clockUserRole = await getClockUserRole(interaction.guild.id)

    userStatus = (interaction.member.roles.cache.has(clockUserRole))
    return userStatus
}

exports.checkTimeUser = checkTimeUser;