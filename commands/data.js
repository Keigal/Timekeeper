const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js');

const {getGuildSettings} = require('../scripts/getGuildSettings');
const {getIndividualTimes} = require('../scripts/getIndividualTimes');
const {convertMsToTime} = require('../scripts/convertMsToTime');
const {checkTimeUser} = require('../scripts/checkTimeUser')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('data')
        .setDescription('Return time clocked since start of current time period.'),
    async execute(interaction) {

        // Ensure member running command is authorized
        userStatus = await checkTimeUser(interaction)
        if (!userStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Get/set variables
        let settings = await getGuildSettings(interaction.guild.id)
        startDate = settings.previous_time_close
        endDate = new Date()
        guild_id = interaction.guild.id
        ds_id = interaction.member.id
        ds_nick = interaction.member.nickname

        // Get total of time clocked by specialty since last time-period close
        currentTimes = await getIndividualTimes(guild_id, ds_id, startDate, endDate)

        // check if any times were returned
        if (currentTimes.length === 0) {
            // Create and send embed
            embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setTitle(`${ds_nick} - Current Totals`)
                .setDescription('No time clocked this time period.')                
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
            .setTitle(`${ds_nick} - Current Totals`)
            .setDescription(message)                
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}
