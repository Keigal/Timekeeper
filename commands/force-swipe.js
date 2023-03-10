// Used by admin to clock any user out
// This command handles the logic of clocking in and out.

const { SlashCommandBuilder } = require('@discordjs/builders');
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')
const {getGuildSettings} = require('../scripts/getGuildSettings')
const {swipe} = require('../scripts/swipe')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('force-swipe')
		.setDescription('Toggle clocked-in status of another user')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('Member to force clock-in/out')
                .setRequired(true)
            ),
	async execute(interaction) {

        // Make sure user is a Time or Discord admin before running command
        adminStatus = await checkTimeAdmin(interaction)
        if (adminStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // role_id = await getClockRole(interaction.guild.id)
        settings = await getGuildSettings(interaction.guild.id)
        role_id = settings.clocked_in_role_id
        specialty = settings.default_specialty
        const member = interaction.options.getMember('member');                 // Stores info of person who is mentioned

        // Clock the user in or out
        swipe(interaction, member, specialty)
        
	},
};