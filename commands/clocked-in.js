// This command returns a list of everyone currently clocked in.

const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {getGuildSettings} = require('../scripts/getGuildSettings')
const {convertMsToTime} = require('../scripts/convertMsToTime')
const {getClockInMembers} = require('../scripts/getClockInMembers')
const {checkTimeUser} = require('../scripts/checkTimeUser')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clocked-in')
		.setDescription('See everyone currently clocked in.')
        .addStringOption(option => 
            option
                .setName('specialty')
                .setDescription('Optional: Choose which specialty to return.')
            ),
	async execute(interaction) {

        // Ensure member running command is authorized
        userStatus = await checkTimeUser(interaction)
        if (!userStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Get guild settings and variables
        const settings = await getGuildSettings(interaction.guild.id)
        const allSpecialties = settings.specialities
        let specialty = interaction.options.getString('specialty')
        let message = ''
        let count = 0

        // Assign specialty to default if none is provided
        if (specialty === null) {
            specialty = ''
        } else {
            // Ensure input is all caps
            specialty = specialty.toUpperCase()
        }

        // Get data of all clocked in members
        const clockedInMembers = await getClockInMembers(interaction)

        // Extract members of specified specialty
        if (specialty) {

            // Check if passed in specialty exists, if not abort and notify user
            validSpecialty = allSpecialties.includes(specialty)

            if (!validSpecialty) {
                interaction.reply(`${specialty} does not exist. Try again and verify spelling.`)
                return
            }

            // Create message to give to embed
            clockedInMembers.forEach((member => {
                if (member.current_shift.specialty == specialty) {
                    currentTime = new Date().getTime()
                    shift_length = currentTime - member.current_shift.start_time
                    shiftString = convertMsToTime(shift_length)
                    message = message.concat(`**${member.ds_nick}** - ${member.current_shift.specialty}\n*${shiftString}*\n\u200B\n`)
                    count ++
                }                
            }))

            // Handle if nobody is found
            if (count === 0) {
                message = `There is nobody clocked in to ${specialty}`
            }
        } 
        
        // Return all clocked in members, regardless of specialty
        else {    
            // create description text for embed
            clockedInMembers.forEach((member => {
                currentTime = new Date().getTime()
                shift_length = currentTime - member.current_shift.start_time
                shiftString = convertMsToTime(shift_length)
                message = message.concat(`**${member.ds_nick}** - ${member.current_shift.specialty}\n*${shiftString}*\n\u200B\n`)
                count ++
            }))

            // Handle if nobody is clocked in
            if (count === 0) {
                message = 'There is nobody clocked in.'
            }
        }

        // create and send embed
        embed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setTitle(`Clocked In: ${specialty}`)
            .setDescription(message)   
            .setFooter({ text: `Total Clocked In: ${count}` })       
        interaction.reply({embeds: [embed]})        
    },
}