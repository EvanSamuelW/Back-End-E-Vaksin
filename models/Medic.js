const mongoose = require('mongoose');

const MedicSchema = mongoose.Schema({
    partner_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Partner"
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    education: {
        type: String,
        required: true
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
    status: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Medic', MedicSchema);