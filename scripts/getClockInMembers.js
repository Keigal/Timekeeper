// DB Models
const Member = require('../models/Member')
const {getGuildSettings} = require('./getGuildSettings')

async function getClockInMembers(interaction) {
    let membersClockedIn;
    Member.find( { guild_id: interaction.guild.id, clocked_in: true }, (err, members) => {
        membersClockedIn = members;
    })

    return new Promise((resolve) => {
        setTimeout(() => resolve(membersClockedIn), 300)
    })
}


// // Retrieve all member IDS with given role
// async function getIDs(interaction) {

//     const settings = await getGuildSettings(interaction.guild.id)
//     const role_id = settings.clocked_in_role_id
//     // const m = await interaction.guild.roles.fetch(role_id)
//     //     .then(role => role.members.map(member => member.id))

//     // ensure all guild members are in cache prior to checking roles
//     await interaction.guild.members.fetch()
//     const memberIDs = interaction.guild.roles.cache.get(role_id).members.map(m=>m.id)

//     return(memberIDs)
// }

// // get member time info
// async function getClockInMembers(interaction) {
//     id_list = await getIDs(interaction)

//     membersClockedIn = []
//     await id_list.forEach((id => {
//         Member.findOne({ ds_id: id, guild_id: interaction.guild.id }, (err, member) => {

//             // Calculate time since clock-in
//             shift_length = new Date().getTime() - member.current_shift.start_time

//             // Create member object with name, shift_length, and current specialty
//             membersClockedIn.push({
//                 name: member.ds_nick,
//                 shift_length: shift_length,
//                 specialty: member.current_shift.specialty,
//                 ds_id: member.ds_id
//             })
//         })
//     }))

//     return new Promise((resolve) => {
//         setTimeout(() => resolve(membersClockedIn), 300)
//     })
// }

exports.getClockInMembers = getClockInMembers;