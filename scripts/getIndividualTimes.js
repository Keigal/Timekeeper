// DB Models
const Shift = require('../models/Shift')
const Member = require('../models/Member')
const Adjustment = require('../models/Adjustment')
const GuildSettings = require('../models/GuildSettings')

async function adjustTimes(times, adjustments) {
    // Format and store times
    adjustments.forEach(adjustment => {

        // Track if time total was found
        timeFound = false

        // Find adjustment in totals
        times.every((time, index) => {
            if (adjustment.ds_id === time.ds_id && adjustment.specialty === time.specialty) {
                times[index].time = time.time + adjustment.time     // Adjust the time
                timeFound = true                                    // Used to break execution of lower code
                return false                                        // Break the loop and move to next adjustment
            } else return true                                      // Continue loop
        })

        // If adjustment doesn't exist, add entry
        if (!timeFound) {
            // Get nickname of member
            Member.findOne({ ds_id: adjustment.ds_id }, (err, member) => {
                if(err) throw err
                ds_nick = member.ds_nick;
                times.push({
                    ds_id: adjustment.ds_id,
                    name: ds_nick,
                    specialty: adjustment.specialty,
                    time: adjustment.time
                })
            })
        }            
    })

    // Return updated times array
    return new Promise((resolve) => {
        setTimeout(() => resolve(times), 300)
    })

}

async function getIndividualTimes(guild_id, ds_id, startDate, endDate) {

    // Get shifts
    const shifts = Shift.aggregate([
        { $match: {guild_id: guild_id, ds_id: ds_id, start_time: { $gte: startDate }, end_time: { $lte: endDate } }},
        { $group: {
            _id: {
                ds_id: '$ds_id',
                specialty: '$specialty'
            },
            total_time: { $sum: '$total_length'}
        }},
        { $lookup: {                                        // LEFT JOIN with the Members table
            from: 'members',
            localField: '_id.ds_id',
            foreignField: 'ds_id',
            pipeline: [                                     // WHERE - Selects which columns to join
                { $project: {name: '$ds_nick'}}
            ],
            as: 'member_info'                               // Name of joined object
        }},
        { $sort: {_id : 1} }                                // Sorting by _id
    ]);

    // Get adjustments
    const adjustments = Adjustment.aggregate([
        { $match: {guild_id:guild_id, ds_id:ds_id, date: {$gte: startDate, $lt: endDate}} },
        { $group: {
            _id: {
                ds_id: '$ds_id',
                specialty: '$specialty'
            },
            total_time: { $sum: '$total_time' }
        }},
        { $sort: {_id : 1} }
    ])

    // Format shift totals into a standard format
    let times = []
    for await (const doc of shifts) {
        entry = {
            ds_id: doc._id.ds_id,
            name: doc.member_info[0].name,
            specialty: doc._id.specialty,
            time: doc.total_time
        }
        times.push(entry)
    }

    // Format adjustments
    timesToAdjust = []
    for await (const doc of adjustments) {
        entry = {
            ds_id: doc._id.ds_id,
            specialty: doc._id.specialty,
            time: doc.total_time
        }
        timesToAdjust.push(entry)
    }

    // Get current times
    currentTimes = await adjustTimes(times, timesToAdjust)

    return new Promise((resolve) => {
        setTimeout(() => resolve(currentTimes), 300)
    })
}

exports.getIndividualTimes = getIndividualTimes;