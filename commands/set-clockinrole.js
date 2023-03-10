const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const GuildSettings = require('../models/GuildSettings')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-clockinrole')
        .setDescription('Set role to add when members clock in')
        .addRoleOption(option => option
            .setName('role')
            .setDescription('The role to set.')
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
                interaction.reply('An error occured while trying to set the clocked-in role.')
                return;
            }

            // Adds discord server to DB if not already in it
            if (!settings) {
                settings = new GuildSettings({
                    guild_id: interaction.guild.id,
                    clocked_in_role_id: interaction.options.getRole('role').id
                })
            } 
            // Updates found record
            else {
                settings.clocked_in_role_id = interaction.options.getRole('role').id
            }

            // Save and confirm new clock channel has been set
            settings.save(err => {
                if (err) {
                    console.log(err)
                    interaction.reply('An error occured while trying to set the clocked-in role.')
                    return;
                }

                interaction.reply(`Clocked-in role has been set to ${interaction.options.getRole('role')}`)
            })
        })

    }
}