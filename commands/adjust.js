const { SlashCommandBuilder } = require('@discordjs/builders')
const Adjustment = require('../models/Adjustment')
const {checkTimeAdmin} = require('../scripts/checkTimeAdmin')
const {getGuildSettings} = require('../scripts/getGuildSettings')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adjust')
		.setDescription('Create a time adjustment for given user.')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('Member to adjust.')
                .setRequired(true)
            )
        .addNumberOption(option =>
            option
                .setName('minutes')
                .setDescription('Number of minutes to add or subtract. Enter as negative to subtract.')
                .setRequired(true)
            )
        .addStringOption(option =>
            option
                .setName('specialty')
                .setDescription('Specialty to add or deduct time from.')
                .setRequired(true)
            ),
	async execute(interaction) {

        // Make sure user is a Time or Discord admin before running command
        adminStatus = await checkTimeAdmin(interaction)
        if (adminStatus) {
            interaction.reply('You do not have permission to use this command') 
            return
        };

        // Get guild settings
        settings = await getGuildSettings(interaction.guild.id)

        // Variable creation
        const member = interaction.options.getMember('member')
        const minutes = interaction.options.getNumber('minutes')
        const allSpecialties = settings.specialities
        let specialty = settings.default_specialty
        const milliseconds = minutes * 60000

        // Set specialty if one is passed through, otherwise use default
        if (interaction.options.getString('specialty')) {
            specialty = interaction.options.getString('specialty').toUpperCase()
            if (!allSpecialties.includes(specialty)) {
                interaction.reply(`${specialty} does not exist. Try again and verify spelling.`)
                return
            }
        }

        // Create new adjustment object
        newAdjustment = {
            ds_id: member.id,
            guild_id: interaction.guild.id,
            specialty: specialty,
            date: new Date(),
            total_time: milliseconds
        }
        
        // Write adjustment to database
        Adjustment.create(newAdjustment)

        // Confirm adjustment with user
        if (milliseconds > 0) {
            interaction.reply(`${member} will have ${minutes} minutes added to ${specialty}.`)
        } else {
            interaction.reply(`${member} will have ${minutes} minutes removed from ${specialty}.`)
        }
	},
};