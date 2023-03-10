const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const GuildSettings = require('../models/GuildSettings')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-expectedtime')
        .setDescription('Set the expected time in minutes members are expected to hit.')
        .addNumberOption(option => option
            .setName('minutes')
            .setDescription('Minutes to set as expected time.')
            .setRequired(true)
        ),
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
                interaction.reply('An error occured while trying to set the expected minutes.')
                return;
            }

            // Adds discord server to DB if not already in it
            if (!settings) {
                settings = new GuildSettings({
                    guild_id: interaction.guild.id,
                    expected_total_time: interaction.options.getNumber('minutes')
                })
            } 
            // Updates found record
            else {
                // Verify the specialty exists
                settings.expected_total_time = interaction.options.getNumber('minutes')                
            }

            // Save and confirm new clock channel has been set
            settings.save(err => {
                if (err) {
                    console.log(err)
                    interaction.reply('An error occured while trying to set the expected minutes.')
                    return;
                }

                interaction.reply(`The expected minutes have been set to: ${settings.expected_total_time}`)
            })
        })

    }
}