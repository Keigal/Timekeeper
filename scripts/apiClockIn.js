const { getGuildSettings } = require('./getGuildSettings')
const Member = require('../models/Member')
const { EmbedBuilder } = require('discord.js');

async function apiClockIn(client, data) {

    // Assign data from POST request to variables
    guild_id = data.guild_id
    ds_id = data.ds_id
    specialty = data.specialty

    // Retrieve guild settings
    settings = await getGuildSettings(guild_id)
    defaultSpecialty = settings.default_specialty
    role_id = settings.clocked_in_role_id
    channel_id = settings.clock_channel_id

    // Assign specialty to default if none is provided
    if (specialty == null) {
        specialty = defaultSpecialty
    } else {
        // Ensure input is all caps
        specialty = specialty.toUpperCase()
    }

    // Retrieve Discord objects
    guild = await client.guilds.fetch(guild_id)
    channel = await client.channels.fetch(channel_id)
    member = await guild.members.fetch(ds_id)

    // Find member in database and start shift
    Member.findOne( { ds_id: ds_id, guild_id: guild_id }, (err, db_member) => {

        // Check for error
        if (err) {
            console.log(err)
            return
        }

        // Check for no member found - Create & continue
        if (!db_member) {
            db_member = new Member({
                ds_id: member.id,
                guild_id: guild_id,
                ds_name: member.user.username,
                ds_discriminator: member.user.discriminator,
                ds_nick: member.displayName,
                current_shift: {},
                clocked_in: false
            })
        }

        // CLOCK IN LOGIC
        if (!db_member.clocked_in) {

            // Create new partial shift
            new_shift = {
                guild_id: guild_id,
                ds_id: member.id,
                specialty: specialty,
                start_time: new Date().getTime()
            }

            // Add clock role to member
            member.roles.add(role_id).then(

                // Ensure DB is storing most current name of member & new shift
                db_member.ds_nick = member.displayName,
                db_member.current_shift = new_shift,
                db_member.clocked_in = true,

                // Save to DB & send confirmation
                db_member.save(err => {
                    // Throw an error and exit command if needed
                    if (err) {
                        console.log(err)
                        return;
                    }

                    // Confirms to user they clocked in
                    embed = new EmbedBuilder()
                        .setColor('#1E90FF')
                        .setDescription(`<@!${member.id}> has clocked in to \`${specialty}\``)
                        .setFooter({ text: 'Automatically clocked-in via API.'})
                    channel.send({ embeds: [embed] })
               
                })
            ).catch(error => {
                sleep(1000).then(() => {
                    if (error.code == 50013) {
                        embed = new EmbedBuilder()
                                .setColor('#1E90FF')
                                .setDescription('Error assigning role. Double-check that the "Timekeeper" role is at the top of your discord role heirarchy.')
                                .setImage('https://gyazo.com/4ab23c8bec9ee8f555f86b0c31230774.png')
                        channel.send({ embeds: [embed] })
                        return
                    }                
                })                
            })  
        }
    })
}

exports.apiClockIn = apiClockIn;