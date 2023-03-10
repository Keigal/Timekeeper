const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const GuildSettings = require('../models/GuildSettings')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-manageclockrole')
        .setDescription('Set role to allow access to admin commands of Time bot')
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
                interaction.reply('An error occured while trying to set the clock manager role.')
                return;
            }

            // Adds discord server to DB if not already in it
            if (!settings) {
                settings = new GuildSettings({
                    guild_id: interaction.guild.id,
                    clock_manager_role: interaction.options.getRole('role').id
                })
            } 
            // Updates found record
            else {
                settings.clock_manager_role = interaction.options.getRole('role').id
            }

            // Save and confirm new clock channel has been set
            settings.save(err => {
                if (err) {
                    console.log(err)
                    interaction.reply('An error occured while trying to set the clock manager role.')
                    return;
                }

                interaction.reply(`Clock manager role has been set to ${interaction.options.getRole('role')}`)
            })
        })
    }
}