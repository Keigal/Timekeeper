// Return available admin level commands

const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {getGuildSettings} = require('../scripts/getGuildSettings')
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help-admin')
		.setDescription('View available commands'),
	async execute(interaction) {

        // Make sure user is a Time or Discord admin before running command
        adminStatus = await checkTimeAdmin(interaction)
        if (adminStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Get guild settings and variables
        settings = await getGuildSettings(interaction.guild.id)

        // Create message to embed
        message = 
        `
            **Setup Commands:** \n
            /init - First command to run when adding bot to server. \n            
            /set-clockchannel - Set channel to listen for commands in.\n            
            /set-clockinrole - Set the role to add while clocked-in.\n            
            /set-userrole - Set the role which grants general access to the bot.\n            
            /set-manageclockrole - Set role to give user access to Admin access of bot. \n            
            /set-expectedtime - Set the number of minutes that users are expected to clock. \n
            /set-defaultspecialty - Set specialty to use when no other is provided for swipe.\n            
            /add-specialty - Add specialty to clock in and out of.\n            
            /remove-specialty - Remove specialty to clock in and out of. \n
            **Use Commands:** \n            
            /force-swipe @user - To force someone to clock-in/out of shift. \n            
            /adjust - To remove or add time from shift totals for user. \n            
            /close-timeperiod - Closes the current time period and returns csv and small report. \n            
            /time-period - Looks up shift totals for a given time-frame.\n
        `

        // create and send embed
        embed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setTitle('Available Admin Commands:')
            .setDescription(message)                
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    },
}