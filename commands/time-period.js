// Return data for all members with clocked hour in time period

// Discordjs packages
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js')

// Other imports
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')
const {getGuildSettings} = require('../scripts/getGuildSettings');
const {getAllTimes} = require('../scripts/getAllTimes');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time-period')
		.setDescription('Return CSV file with all data from given time period.')
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

        // Setting up variables
        let settings = await getGuildSettings(interaction.guild.id)
        guild_id = settings.guild_id

        // Convert inputted dates to Unix Date objects
        const startDate = await getDate(interaction.options.getString('start-date'))
        const endDate = await getDate(interaction.options.getString('end-date'))

        // Gett all times from all members in time period
        rawTimes = await getAllTimes(guild_id, startDate, endDate)

        // convert milliseconds to minutes
        times = rawTimes.map(obj => {
            minutes = Math.floor(obj.time / 60000)
            return {...obj, time: minutes}
        })
        
        // Create the new csv
        const csvWriter = createCsvWriter({
            path: './cache/time_period.csv',
            header: [
                {id: 'ds_id', title:'DISCORD_ID'},
                {id: 'name', title:'NAME'},
                {id: 'specialty', title:'SPECIALTY'},
                {id: 'time', title:'MINUTES'}
            ]
        })
        csvWriter.writeRecords(times)

        // Reply to user with file
        file = new AttachmentBuilder()
        .setFile('./cache/time_period.csv')
    
        interaction.reply({
            content: `**Time Period:** \n Start: \`${startDate}\` \n End:\`${endDate}\``,
            files: [file]
        })
    },
}

// Convert date string to Date object
async function getDate(dateString) {
    const date = await new Date(dateString)

    return new Promise((resolve) => {
        setTimeout(() => resolve(date), 300)
    })
}