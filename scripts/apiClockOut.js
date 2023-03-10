const { getGuildSettings } = require('./getGuildSettings')
const { convertMsToTime } = require('./convertMsToTime')
const Member = require('../models/Member')
const Shift = require('../models/Shift')
const { EmbedBuilder } = require('discord.js');

async function apiClockOut(client, data) {

    // Assign data from POST request to variables
    guild_id = data.guild_id
    ds_id = data.ds_id

    // Retrieve guild settings
    settings = await getGuildSettings(guild_id)
    role_id = settings.clocked_in_role_id
    channel_id = settings.clock_channel_id

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

        // Check for no member found - Create & end
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
            return
        }

        // CLOCK OUT LOGIC
        if (db_member.clocked_in) {

            // Calculate totals for new shift object
            end_time = new Date().getTime()
            total_length = end_time - db_member.current_shift.start_time

            // Prepare Shift object to be written to DB
            new_shift = {
                ds_id: db_member.ds_id,
                guild_id: db_member.guild_id,
                specialty: db_member.current_shift.specialty,
                start_time: db_member.current_shift.start_time,
                end_time: end_time,
                total_length: total_length
            }

            // Write new shift to DB
            Shift.create(new_shift)

            // Removes shift that just ended from member
            db_member.current_shift = {}
            db_member.clocked_in = false

            // Remove discord role from user
            member.roles.remove(role_id).then(
                // Save updated member to DB
                db_member.save(err => {
                    // Throw an error and exit command if needed
                    if (err) {
                        console.log(err)
                        channel.send('An error occured while trying to clock-in')
                        return;
                    }

                    // Confirms to user they clocked in
                    timeString = convertMsToTime(new_shift.total_length)
                    embed = new EmbedBuilder()
                        .setColor('#1E90FF')
                        .setDescription(`<@!${member.id}> has clocked out of \`${new_shift.specialty}\`\n\`${timeString}\` has been added to total time.`)
                        .setFooter({ text: 'Automatically clocked-out via API.'})
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

exports.apiClockOut = apiClockOut;