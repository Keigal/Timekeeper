// Standard bot packages
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
require('dotenv').config()

// Api packages
const express = require ('express')
const bodyParser = require('body-parser')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const { apiClockIn } = require('../scripts/apiClockIn')
const { apiClockOut } = require('../scripts/apiClockOut')
const GuildSettings = require('../models/GuildSettings')

const app = express()
app.use(bodyParser.json())

module.exports = {
    name: 'ready',
    once: true,
    execute (client, commands) {
        console.log('Time is online.')

        // Registering the slash commands
        const CLIENT_ID = client.user.id
        const rest = new REST({
            version: '9'
        }).setToken(process.env.TOKEN);

        (async () => {
            try {
                if (process.env.ENV === 'production') {
                    await rest.put(Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    })
                    console.log('Successfully registered commands globally.')
                } else {
                    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {
                        body: commands
                    })
                    console.log('Successfully registered commands locally.')
                    }
            } catch (err) {
                if (err) console.log(err)
            }
        })();

        // Setting up clock-in route
        app.post('/clock-in', async (req, res) => {
            let data = req.body

            // Authenticate API
            api_key = data.api_key

            if (!api_key) {
                res.status(200).send({ message: 'Invalid API key.' })
                return
            }

            GuildSettings.findOne({ api_key: data.api_key }, (err, settings) => {
                if (err) {
                    console.log(err)
                    return
                }

                if (!settings) {
                    res.status(200).send({ message: 'Invalid API key.' })
                } else {
                    // add guild id into data
                    data.guild_id = settings.guild_id
                    apiClockIn(client, data)
                    res.status(200).send({ message: 'Clock-in API Reached.' })
                }
            })            
        })

        // Setting up clock-out route
        app.post('/clock-out', async (req, res) => {
            let data = req.body

            // Authenticate API
            api_key = data.api_key

            if (!api_key) {
                res.status(200).send({ message: 'Invalid API key.' })
                return
            }

            GuildSettings.findOne({ api_key: data.api_key }, (err, settings) => {
                if (err) {
                    console.log(err)
                    return
                }

                if (!settings) {
                    res.status(200).send({ message: 'Invalid API key.' })
                } else {
                    // add guild id into data
                    data.guild_id = settings.guild_id
                    apiClockOut(client, data)
                    res.status(200).send({ message: 'Clock-in API Reached.' })
                }
            })
        })

        // listen for HTTPS traffic
        https
            .createServer(
                {
                    key: fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
                    cert: fs.readFileSync(path.resolve(__dirname, '../certs/cert.pem'))
                },
                app)
            .listen(443, ()=>{
                console.log(`Listening for HTTPS traffic.`)
            })

        // listen for HTTP traffic
        http.createServer(app).listen(80, ()=>{
            console.log('Listening for HTTP traffic.')
        })

        // Start express server using HTTP
        // app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))

    }
}