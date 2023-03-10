const GuildSettings = require('../models/GuildSettings')

module.exports = {
    name: 'interactionCreate',
    async execute (interaction) {
        // Check if interaction is a command
        if (!interaction.isChatInputCommand()) return;
        
        // Check if command exists
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) return;

        try {

            allowCommand = await checkInitialized(command, interaction)

            if (allowCommand) {
                // Run command
                await command.execute(interaction)
            }

        } catch(err) {
            if (err) console.log(err);
            await interaction.reply({
                content: 'An error occurred while executing that command.',
                ephemeral: true        // Only shows the user running the command the error
            })
        }
    }
}

// Get time management role
async function checkInitialized(command, interaction) {
    let initialized = false

    GuildSettings.findOne({ guild_id: interaction.guild.id }, (err, settings) => {
        // Server not found in settings DB
        if (!settings) {
            // Command run is not /init
            if (command.data.name != 'init'){
                interaction.reply({
                    content: 'This server has not been initialized. Please run /init.',
                    ephemeral: true
                })
            } else {
                initialized = true
            }       
        } else {
            initialized = true
        }
    })

    return new Promise((resolve) => {
        setTimeout(() => resolve(initialized), 300)
    })
}