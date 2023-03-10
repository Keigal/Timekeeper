// Return available user level commands

const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {getGuildSettings} = require('../scripts/getGuildSettings')
const {checkTimeUser} = require('../scripts/checkTimeUser')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('View available commands'),
	async execute(interaction) {

        // Ensure member running command is authorized
        userStatus = await checkTimeUser(interaction)
        if (!userStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Get guild settings and variables
        settings = await getGuildSettings(interaction.guild.id)

        // Create message to embed
        message = 
        `
            /swipe - Clocking in/out \n
            /swipe SPECIALTY - To clock in with a specialty assigned to the shift. \n
            /clocked-in - View everyone currently clocked in. \n
            /data - View clocked time since the close of previous time-period. \n
            /lifetime - View all every clocked on this bot. \n
            /list-specialties - View available specialties to clock in/out of.   \n
        `

        // create and send embed
        embed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setTitle('Available Commands:')
            .setDescription(message)                
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    },
}