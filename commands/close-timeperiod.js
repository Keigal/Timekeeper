// Return data for all members with clocked hour in time period

// Discordjs packages
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js')
const { EmbedBuilder } = require('discord.js');

// DB Models
const GuildSettings = require('../models/GuildSettings')

// Other imports
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')
const {getGuildSettings} = require('../scripts/getGuildSettings');
const {getClockInMembers} = require('../scripts/getClockInMembers')
const {convertMsToTime} = require('../scripts/convertMsToTime')
const {swipe} = require('../scripts/swipe')
const {getAllTimes} = require('../scripts/getAllTimes');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close-timeperiod')
		.setDescription('Close the current time period.'),
	async execute(interaction) {

        // Make sure user is a Time or Discord admin before running command
        adminStatus = await checkTimeAdmin(interaction)
        if (adminStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // this command takes over 3 seconds, so defer reply
        await interaction.deferReply()

        // Setting up variables
        let settings = await getGuildSettings(interaction.guild.id)
        guild_id = settings.guild_id
        channel_id = settings.clock_channel_id
        channel = await interaction.guild.channels.cache.get(channel_id)
        expectedMinutes = settings.expected_total_time
        lastClose = settings.previous_time_close
        const clockedInMembers = await getClockInMembers(interaction)

        // Hard-coded dates for developing/troubleshooting
        // lastClose = new Date('2022-05-01')
        // newClose = new Date('2022-08-03')

        // Handle if guild has never closed a time period
        if (!lastClose) {
            // Immediatly update settings and close function
            GuildSettings.updateOne(
                { guild_id: guild_id }, 
                { previous_time_close: newClose },
                (err) => {
                    if (err) {
                        console.log(err)
                        interaction.reply('There was an error closing the time period.')
                        return;
                    }
            })
            return
        }

        // // Get all members currently clocked in & clock them out
        rawFinalTimes = await swipeThenRead(interaction, clockedInMembers)
        await notifyMembers(interaction, clockedInMembers)

        // convert milliseconds to minutes
        finalTimes = rawFinalTimes.map(obj => {
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
        csvWriter.writeRecords(finalTimes)

        // Update last-closed date in guild settings
        GuildSettings.updateOne(
            { guild_id: guild_id }, 
            { previous_time_close: newClose },
            (err) => {
                if (err) {
                    console.log(err)
                    interaction.reply('There was an error closing the time period.')
                    return;
                }
            }
        )

        // Clock members back in
        swipeMembers(interaction, clockedInMembers)

        // Prepare variables for report
        allStaffTime = finalTimes.reduce((total, obj) => obj.time + total,0)                // Total minutes for all members

        // Total minutes for each member
        memberTotalTimes = []
        finalTimes.reduce((res, value) => {
            if (!res[value.ds_id]) {
                res[value.ds_id] = { ds_id: value.ds_id, name: value.name, time: 0 }
                memberTotalTimes.push(res[value.ds_id])
            }
            res[value.ds_id].time += value.time
            return res
        }, {})

        // Find members with minutes < expectedMinutes
        underTimeMessage = ''
        memberTotalTimes.forEach((member) => {
            if (member.time < expectedMinutes) {
                underTimeMessage = underTimeMessage.concat(`${member.name} only clocked ${member.time} minutes.\n`)
            }
        })

        if (underTimeMessage == ''){
            underTimeMessage = 'All members achieved expected times.'
        }

        // Create time-frame message
        timeFrameMessage = `Start: \`${lastClose}\` \n End:\`${newClose}\``

        // Create clocked-in member notifcation message
        if (!clockedInMembers.length == 0) {
            shiftSplitMessage = ''
            clockedInMembers.forEach((member) => {
                currentTime = new Date().getTime()
                shift_length = currentTime - member.current_shift.start_time
                shiftSplitMessage = shiftSplitMessage.concat(`${member.ds_nick} added current shift of ${Math.floor(shift_length / 60000)} minutes.\n`)
            })
        } else {
            shiftSplitMessage = 'No members clocked in for time-period close.'
        }        
         
        // Reply to user with file
        file = new AttachmentBuilder()
            .setFile('./cache/time_period.csv')
        
        embed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setTitle(`Report for closed time period:`)
            .setDescription(`A grand total of \`${allStaffTime}\` minutes were clocked.`)
            .addFields(
                { name: `Clocked time under \`${expectedMinutes}\` minutes:`, value: underTimeMessage },
                { name: 'Time Period', value: timeFrameMessage },
                { name: 'Carry Over Shifts', value: shiftSplitMessage}
            )

        try {
            interaction.editReply({
                files: [file],
                embeds: [embed]
            })  
        } catch {
            interaction.editReply('There was an error closing the time period.')
        }

     
    },
}

// Swipe all members in list
async function swipeMembers(interaction, memberList) {
    let result = []
    for await (const member of memberList) {
        m = await interaction.guild.members.fetch(member.ds_id)
        result.push(swipe(interaction, m, member.current_shift.specialty, false) )
    }
    // return result
    return new Promise((resolve) => {
        setTimeout(() => resolve(result), 500)
    })
}

// Swipe all members, then read updated DB
async function swipeThenRead(interaction, clockedInMembers) {

    // Get all members currently clocked in & clock them out
    // const clockedInMembers = await getClockInMembers(interaction)
    f = await swipeMembers(interaction, clockedInMembers)

    newClose = new Date()
    rawFinalTimes = await getAllTimes(guild_id, lastClose, newClose)

    return new Promise((resolve) => {
        setTimeout(() => resolve(rawFinalTimes), 300)
    })
}

// Notify members they have been clocked out
async function notifyMembers(interaction, memberList) {
    for await (const member of memberList) {

        // Get GuildMember Object for member
        m = await interaction.guild.members.fetch(member.ds_id)

        // Get variables
        specialty = member.current_shift.specialty
        end_time = new Date().getTime()
        total_length = end_time - member.current_shift.start_time
        timeString = convertMsToTime(total_length)      
        
        // Prepare embed
        embed = new EmbedBuilder()
            .setColor('#1E90FF')
            // .setDescription(`<@!${member.id}> has clocked out of \`${new_shift.specialty}\`\n\`${timeString}\` has been added to total time.`)
            .setDescription(`The time period has been closed. ${m} has been clocked out of \`${specialty}\`\n\`${timeString}\` has been added to total time.`)
            .setFooter({ text: 'A new shift has been automatically started.' })

        // DM user the automatically closed shift
        // dmChannel = await m.createDM()
        // dmChannel.send({ embeds: [embed] })
        channel.send({ embeds: [embed]})
    }
    // return result
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 500)
    })
}