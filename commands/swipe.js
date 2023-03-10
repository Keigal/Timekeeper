// This command handles the logic of clocking in and out.

const { SlashCommandBuilder } = require('@discordjs/builders');
const {getGuildSettings} = require('../scripts/getGuildSettings')
const {checkTimeUser} = require('../scripts/checkTimeUser')
const {swipe} = require('../scripts/swipe')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('swipe')
		.setDescription('Toggle clocked-in status.')
        .addStringOption(option => 
            option
                .setName('specialty')
                .setDescription('Choose what specialty to clock-in to.')
            ),
	async execute(interaction) {

        // Ensure member running command is authorized
        userStatus = await checkTimeUser(interaction)
        if (!userStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Preparing variables
        settings = await getGuildSettings(interaction.guild.id)
        const member = interaction.member;                                     // Stores info of person who ran command
        const allSpecialties = settings.specialities
        const defaultSpecialty = settings.default_specialty
        let specialty = interaction.options.getString('specialty')

        // Assign specialty to default if none is provided
        if (specialty === null) {
            specialty = defaultSpecialty
        } else {
            // Ensure input is all caps
            specialty = specialty.toUpperCase()
        }

        // Check if passed in specialty exists, if not abort and notify user
        validSpecialty = allSpecialties.includes(specialty)

        if (!validSpecialty) {
            interaction.reply(`${specialty} does not exist. Try again and verify spelling.`)
            return
        }

        // Execute clocking the member in or out
        swipe(interaction, member, specialty)

	},
};