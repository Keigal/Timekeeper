const mongoose = require('mongoose')

const ShiftSchema = new mongoose.Schema({
    ds_id: String,                                          // Unique discord id of member
    guild_id: String,                                       // Guild that member is affiliated with
    specialty: String,                                      // Specialty member was clocked in to
    start_time: Date,                                       // Start time using Unix Epoch
    end_time: Date,                                         // End time using Unix Epoch
    total_length: Number                                    // Milliseconds between start and end time
})

module.exports = mongoose.model('Shift', ShiftSchema)