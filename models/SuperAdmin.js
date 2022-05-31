const mongoose = require('mongoose');

const SuperAdminSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    position: {
        type: String,
        required: true
    },
    join_date: {
        type: Date,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    is_active: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);