const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const GuildSettings = require('../models/GuildSettings')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-specialty')
        .setDescription('Add specialty to be clocked in to.')
        .addStringOption( (option) =>
            option
                .setName('specialty')
                .setDescription('Specicialty category to add to guild settings')
                .setRequired(true)
    ),
    async execute(interaction) {

        // Only checks for Discord Admin role
        if ( !interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) {
            interaction.reply('You do not have permission to use this command.');
            return;
        }

        newSpecialty = interaction.options.getString('specialty').toUpperCase()
        
        // Add new specialty to list
        GuildSettings.updateOne(
            { guild_id: interaction.guild.id },
            { $addToSet: { specialities: newSpecialty } },
            (err) => {
                if (err) {
                    console.log(err)
                    interaction.reply('There was an error adding the new specialty.')
                    return;
                }
                interaction.reply(`${newSpecialty} has been successfully added to available specialities.`)
            }
        )
    }
}