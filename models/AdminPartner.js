const mongoose = require('mongoose');

const AdminPartnerSchema = mongoose.Schema({
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

module.exports = mongoose.model('AdminPartners', AdminPartnerSchema);