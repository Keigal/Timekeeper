const { SlashCommandBuilder } = require('@discordjs/builders');
const { IntegrationApplication } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings')
const {checkTimeUser} = require('../scripts/checkTimeUser')
const {getGuildSettings} = require('../scripts/getGuildSettings');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-specialities')
        .setDescription('List available specialities to clock-in to.'),
    async execute(interaction) {

        // Ensure member running command is authorized
        userStatus = await checkTimeUser(interaction)
        if (!userStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // get settings containing specialities from guild settings
        settings = await getGuildSettings(interaction.guild.id)
        specialities = settings.specialities
        defaultSpecialty = settings.default_specialty

        // Construct specialities message
        // handle no specialities
        if (specialities.length == 0) {
            specString = 'No specialities have been added to clock in to.'
        } else {
            specString = ''
            specialities.forEach(specialty => {
                if (specialty == defaultSpecialty) {
                    specString = specString.concat(`${specialty} - *Default* \n`)
                } else {
                    specString = specString.concat(`${specialty} \n`)
                }
            })
        }

        // reply to user with specialities
        embed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setTitle(`Available Specialties`)
            .setDescription(specString)                
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })


    }
}