const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const GuildSettings = require('../models/GuildSettings')
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-defaultspecialty')
        .setDescription('Set the default specialty to use when clocking in/out.')
        .addStringOption(option => option
            .setName('specialty')
            .setDescription('The specialty to set as the default.')
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
                interaction.reply('An error occured while trying to set the default specialty.')
                return;
            }

            // Adds discord server to DB if not already in it
            if (!settings) {
                // Rather than creating a GuildSettings object, prompt user to do so using /add-specialty
                interaction.reply('Specialty must be added using /add-specialty prior to being set as default.')
                return
            } 
            // Updates found record
            else {
                // Verify the specialty exists
                defaultSpecialty = interaction.options.getString('specialty').toUpperCase()
                validSpecialty = settings.specialities.includes(defaultSpecialty)
                if (validSpecialty) {
                    settings.default_specialty = defaultSpecialty
                } else {
                    interaction.reply('Specialty must be added using /add-specialty prior to being set as default.')
                    return
                }
                
            }

            // Save and confirm new clock channel has been set
            settings.save(err => {
                if (err) {
                    console.log(err)
                    interaction.reply('An error occured while trying to set the default specialty.')
                    return;
                }

                interaction.reply(`The default specialty has been set to: ${defaultSpecialty}`)
            })
        })

    }
}