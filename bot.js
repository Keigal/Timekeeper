require('dotenv').config()                              // used to load in env process variables
const fs = require('fs')
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const Database = require('./config/Database')

// Connect to Database
const db = new Database()
db.connect()


// Creating client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // GatewayIntentBits.GuildMembers,
        // GatewayIntentBits.GuildMessages
    ]
})

// Get all commands from commands folder and adds to bot
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

const commands = []
client.commands = new Collection()

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)           // Gets command from current command.js file
    commands.push(command.data.toJSON())                    // Registers the actual command
    client.commands.set(command.data.name, command)         // Prepares the slash commands to all be registered on bot startup
}

// Get and register all events in event folder
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))

// Loop through and register each event
for (const file of eventFiles) {
    const event = require(`./events/${file}`)

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, commands))
    } else {
        client.on(event.name, (...args) => event.execute(...args, commands))
    }
}    

// Logs the bot in
client.login(process.env.TOKEN)