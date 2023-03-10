const { EmbedBuilder } = require('discord.js');
const Member = require('../models/Member')
const Shift = require('../models/Shift')
const {convertMsToTime} = require('../scripts/convertMsToTime')
const {getGuildSettings} = require('./getGuildSettings')

async function swipe(interaction, member, specialty, reply=true) {

    // Variable setup
    const settings = await getGuildSettings(interaction.guild.id)
    const role_id = settings.clocked_in_role_id
    const clockedIn = member.roles.cache.has(role_id);         // Checks if member has the On Duty role


    // CLOCK-IN LOGIC
    if (!clockedIn) {

        // Add On-Duty Role
        member.roles.add(role_id)

        // Update member in DB to begin current shift
        Member.findOne( {ds_id: member.id, guild_id: interaction.guild.id}, (err, db_member) => {

            // Return error and exit command
            if (err) {
                console.log(err)
                interaction.reply('An error occured while trying to clock-in')
                return;
            }

            // Create new shift object
            new_shift = {
                ds_id: member.id,
                specialty: specialty,
                guild_id: interaction.guild.id,
                start_time: new Date().getTime()
            }

            // Adds member to DB, if not found
            if (!db_member){
                db_member = new Member({
                    ds_id: member.id,
                    guild_id: interaction.guild.id,
                    ds_name: member.user.username,
                    ds_discriminator: member.user.discriminator,
                    ds_nick: member.displayName,
                    current_shift: new_shift
                })
            }
            // Updates found member
            else {
                    db_member.ds_nick = member.displayName,
                    db_member.current_shift = new_shift
            }

            // Save the new/updated member
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
                    .setDescription(`${member} has clocked in to \`${specialty}\``)
                    interaction.reply({ embeds: [embed] });
                } else return
                
            })
        })
    } 
    
    // CLOCK-OUT LOGIC
    else {

        // Remove On-Duty Role
        member.roles.remove(role_id)

        // Temporary closing current shift
        // Update member in DB to begin current shift
        Member.findOne( {ds_id: member.id, guild_id: interaction.guild.id}, (err, db_member) => {

            // Return error and exit command
            if (err) {
                console.log(err)
                interaction.reply('An error occured while trying to clock-in')
                return;
            }

            // Create end time & calculate total length in milliseconds
            end_time = new Date().getTime()
            total_length = end_time - db_member.current_shift.start_time

            // Create new shift object
            new_shift = {
                ds_id: db_member.ds_id,
                guild_id: db_member.guild_id,
                specialty: db_member.current_shift.specialty,
                start_time: db_member.current_shift.start_time,
                end_time: end_time,
                total_length: total_length
            }

            // Save ended shift to database
            Shift.create(new_shift)

            // Removes shift that just ended from member
            db_member.current_shift = {}

            // Save the new/updated member
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
                        .setDescription(`${member} has clocked out of \`${new_shift.specialty}\`\n\`${timeString}\` has been added to total time.`)
                    interaction.reply({ embeds: [embed] });
                } else return

            })
        })
    }
}

exports.swipe = swipe;