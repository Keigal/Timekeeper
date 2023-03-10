const mongoose = require('mongoose')

const AdjustmentSchema = new mongoose.Schema({
    ds_id: String,                                          // Unique discord id of member
    guild_id: String,                                       // Guild that member is affiliated with
    specialty: String,                                      // Specialty time to adjust
    date: Date,                                             // Date adjustment was entered
    total_time: Number                                      // Millisecond total of time adjusted - Can be positive or negative
})

module.exports = mongoose.model('Adjustment', AdjustmentSchema)