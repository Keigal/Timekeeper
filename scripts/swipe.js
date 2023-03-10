const { EmbedBuilder, DiscordAPIError } = require('discord.js');
const Member = require('../models/Member')
const Shift = require('../models/Shift')
const {convertMsToTime} = require('../scripts/convertMsToTime')
const {getGuildSettings} = require('./getGuildSettings')

// Used to provide feedback with possible config error.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function swipe(interaction, member, specialty, reply=true) {

    // Variable setup
    const settings = await getGuildSettings(interaction.guild.id)
    const role_id = settings.clocked_in_role_id

    // Lookup member
    Member.findOne( { ds_id: member.id, guild_id: interaction.guild.id }, (err, db_member) => {

        // Check for error
        if (err) {
            console.log(err)
            interaction.reply('An error occured while trying to clock-in.')
            return;
        }

        // Check for no member found - Create & continue
        if (!db_member) {
            db_member = new Member({
                ds_id: member.id,
                guild_id: interaction.guild.id,
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
                guild_id: interaction.guild.id,
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
                        interaction.reply('An error occured while trying to clock-in')
                        return;
                    }
                    if (reply){
                        // Confirms to user they clocked in
                        embed = new EmbedBuilder()
                        .setColor('#1E90FF')
                        .setDescription(`<@!${member.id}> has clocked in to \`${specialty}\``)
                        interaction.reply({ embeds: [embed] });
                    } else return                
                })
            ).catch(error => {
                sleep(1000).then(() => {
                    if (error.code == 50013) {
                        embed = new EmbedBuilder()
                                .setColor('#1E90FF')
                                .setDescription('Error assigning role. Double-check that the "Timekeeper" role is at the top of your discord role heirarchy.')
                                .setImage('https://gyazo.com/4ab23c8bec9ee8f555f86b0c31230774.png')
                        interaction.followUp({ embeds: [embed] });
                        return
                    }                
                })                
            })  
        }

        // CLOCK OUT LOGIC
        else {

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
                        interaction.reply('An error occured while trying to clock-in')
                        return;
                    }

                    if (reply) {
                        // Confirms to user they clocked in
                        timeString = convertMsToTime(new_shift.total_length)
                        embed = new EmbedBuilder()
                            .setColor('#1E90FF')
                            .setDescription(`<@!${member.id}> has clocked out of \`${new_shift.specialty}\`\n\`${timeString}\` has been added to total time.`)
                        interaction.reply({ embeds: [embed] });
                    } else return
                })
            ).catch(error => {
                sleep(1000).then(() => {
                    if (error.code == 50013) {
                        embed = new EmbedBuilder()
                                .setColor('#1E90FF')
                                .setDescription('Error assigning role. Double-check that the "Timekeeper" role is at the top of your discord role heirarchy.')
                                .setImage('https://gyazo.com/4ab23c8bec9ee8f555f86b0c31230774.png')
                        interaction.followUp({ embeds: [embed] });
                        return
                    }                
                })                
            })
        }
    })
}

exports.swipe = swipe;