const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js');

const {getIndividualTimes} = require('../scripts/getIndividualTimes');
const {convertMsToTime} = require('../scripts/convertMsToTime');
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-totals')
        .setDescription('Return time totals of user in provided time-period')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('Member to retrieve data for.')
                .setRequired(true)
            )
        .addStringOption( (option) => 
            option
                .setName('start-date')
                .setDescription('Start date for lookup, enter as YYYY-MM-DD')
                .setRequired(true)
        )
        .addStringOption( (option) => 
            option
                .setName('end-date')
                .setDescription('End date for lookup, enter as YYYY-MM-DD')
                .setRequired(true)
        ),
    async execute(interaction) {

        // Make sure user is a Time or Discord admin before running command
        adminStatus = await checkTimeAdmin(interaction)
        if (adminStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Get/set variables
        guild_id = interaction.guild.id
        ds_id = interaction.options.getMember('member').id
        ds_nick = interaction.options.getMember('member').nickname

        // Convert inputted dates to Unix Date objects
        const startDate = await getDate(interaction.options.getString('start-date'))
        const endDate = await getDate(interaction.options.getString('end-date'))
        const startString = interaction.options.getString('start-date')
        const endString = interaction.options.getString('end-date')

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
            .setTitle(`${ds_nick} - Totals`)
            .setDescription(message)  
            .setFooter({ text: `${startString} thru ${endString}` })                 
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

// Convert date string to Date object
async function getDate(dateString) {
    const date = await new Date(dateString)

    return new Promise((resolve) => {
        setTimeout(() => resolve(date), 300)
    })
}