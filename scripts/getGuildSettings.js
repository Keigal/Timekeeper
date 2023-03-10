const GuildSettings = require('../models/GuildSettings')

async function getGuildSettings(guild_id) {
    GuildSettings.findOne({ guild_id: guild_id }, (err, settings) => {
        if (err) {
            console.log(err)
            interaction.reply('An error occured while trying to check clocked in members.')
            return;
        }
        guildSettings = settings            
    })
    return new Promise((resolve) => {
        setTimeout(() => resolve(guildSettings), 300)
    })
}

exports.getGuildSettings = getGuildSettings;