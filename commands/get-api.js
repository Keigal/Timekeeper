const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const { generateApiKey } = require('generate-api-key');
const GuildSettings = require('../models/GuildSettings')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-api')
        .setDescription('Retrieve unique API key for server.'),
    async execute(interaction) {

        // Only checks for Discord Admin role
        if ( !interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) {
            interaction.reply('You do not have permission to use this command.');
            return;
        }

        // Adds or modified guild settings - done with setttings variable
        GuildSettings.findOne({ guild_id: interaction.guild.id }, (err, settings) => {
            if (err) {
                console.log(err)
                interaction.reply('An error occured while trying to set the clock manager role.')
                return;
            }

            // Tell user to initialize guild if not found
            if (!settings) {
                interaction.reply('Server has not been initialized. To fix run /init.')
                return
            }

            // If no API - Create and save
            if (!settings.api_key) {
                settings.api_key = generateApiKey({ 
                    method: 'string', 
                    length: 24,
                    prefix: 'tb_'
                })
            }

            // Save and confirm new clock channel has been set
            settings.save(err => {
                if (err) {
                    console.log(err)
                    interaction.reply('An error occured while trying to retrieve API.')
                    return;
                }

                interaction.reply({
                    content: `API Key: \`${settings.api_key}\``,
                    ephemeral: true
                })

            })
        })
    }
}