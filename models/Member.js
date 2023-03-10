const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema({
    ds_id: String,                                          // Unique discord id of member
    guild_id: String,                                       // Guild that member is affiliated with
    ds_name: String,                                        // Discord name of user
    ds_discriminator: Number,                               // Four digit discord discriminator of user
    ds_nick: String,                                        // Nickname of user on guild
    clocked_in: Boolean,
    current_shift: Object                                   // Current shift
})

module.exports = mongoose.model('Member', MemberSchema)