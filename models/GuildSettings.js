const mongoose = require('mongoose')

const GuildSettingsSchema = new mongoose.Schema({
    guild_id: String,
    guild_name: String,
    clock_channel_id: String,
    clocked_in_role_id: String,
    user_role: String,
    clock_manager_role: String,
    default_specialty: String,
    expected_total_time: Number,
    previous_time_close: Date,
    specialities: Array,
    api_key: String
})

module.exports = mongoose.model('GuildSettings', GuildSettingsSchema)