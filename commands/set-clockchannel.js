const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const GuildSettings = require('../models/GuildSettings')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-clockchannel')
        .setDescription('Set primary channel to clock in and out.')
        .addChannelOption(option => option
            .setName('clock')
            .setDescription('The channel to set as the clock channel.')
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
                interaction.reply('An error occured while trying to set the clock channel.')
                return;
            }

            // Adds discord server to DB if not already in it
            if (!settings) {
                settings = new GuildSettings({
                    guild_id: interaction.guild.id,
                    clock_channel_id: interaction.options.getChannel('clock').id
                })
            } 
            // Updates found record
            else {
                settings.clock_channel_id = interaction.options.getChannel('clock').id
            }

            // Save and confirm new clock channel has been set
            settings.save(err => {
                if (err) {
                    console.log(err)
                    interaction.reply('An error occured while trying to set the clock channel.')
                    return;
                }

                interaction.reply(`Clock channel has been set to ${interaction.options.getChannel('clock')}`)
            })
        })
    }
}