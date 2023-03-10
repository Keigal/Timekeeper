const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const GuildSettings = require('../models/GuildSettings')
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Intialize Time bot to the server.')
        .addChannelOption(option => option
            .setName('time_channel')
            .setDescription('Channel to use for access to Time bot.')
            .setRequired(true))
        .addRoleOption(option => option
            .setName('user_role')
            .setDescription('Role that allows users to clock in/out.')
            .setRequired(true))
        .addRoleOption(option => option
            .setName('active_clock_role')
            .setDescription('Role to grant members who are clocked in.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('default_specialty')
            .setDescription('Default specialty to clock members in to.')
            .setRequired(true)),
    async execute(interaction) {

        // variable setup
        def_specialty = interaction.options.getString('default_specialty').toUpperCase()

        // Check that user is an admin on the server
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
                    guild_name: interaction.guild.name,
                    clock_channel_id: interaction.options.getChannel('time_channel').id,
                    user_role: interaction.options.getRole('user_role').id,
                    clocked_in_role_id: interaction.options.getRole('active_clock_role').id,
                    specialities: [ def_specialty ],
                    default_specialty: def_specialty,
                    previous_time_close: new Date()
                })
            } 
            // Updates found record
            else {
                settings.guild_id = interaction.guild.id
                settings.guild_name = interaction.guild.name
                settings.clock_channel_id = interaction.options.getChannel('time_channel').id
                settings.PermissionsBitFielduser_role = interaction.options.getRole('user_role').id
                settings.clocked_in_role_id = interaction.options.getRole('active_clock_role').id
                settings.specialities = [ def_specialty ]
                settings.default_specialty = def_specialty
                settings.previous_time_close = new Date()
            }

            // Save and confirm new clock channel has been set
            settings.save(err => {
                if (err) {
                    console.log(err)
                    interaction.reply('An error occured while trying to set the clock channel.')
                    return;
                }

                interaction.reply(`Settings have been initialized for \`${ interaction.guild.name }\``)
            })
        })

    }
        
}