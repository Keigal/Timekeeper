// Returns all hours ever clocked in

const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {getIndividualTimes} = require('../scripts/getIndividualTimes')
const {convertMsToTime} = require('../scripts/convertMsToTime');
const {checkTimeUser} = require('../scripts/checkTimeUser')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lifetime')
		.setDescription('Return all hours clocked since implementation'),
	async execute(interaction) {

        // Ensure member running command is authorized
        userStatus = await checkTimeUser(interaction)
        if (!userStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Setup variables
        const guild_id = interaction.guild.id
        const ds_id = interaction.member.id
        const ds_nick = interaction.member.nickname
        const startDate = new Date('2022-07-01')                // Start time is before bot existed, therefore before any data existed
        const endDate = new Date()                              // Current time
        lifetimeTotals = await getIndividualTimes(guild_id, ds_id, startDate, endDate)

        // check if any times were returned
        if (currentTimes.length === 0) {
            // Create and send embed
            embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setTitle(`${ds_nick} Lifetime Totals`)
                .setDescription('No time ever clocked.')                
            interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
            return
        }

        // Prepare message
        let message = ''
        currentTimes.forEach((time) => {
            specialty = time.specialty
            milliseconds = time.time
            timeString = convertMsToTime(milliseconds)
            message = message.concat(`${specialty} - *${timeString}*\n`)
        })

        // Create and send embed
        embed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setTitle(`${ds_nick} - Lifetime Totals`)
            .setDescription(message)                
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })        
    },
}