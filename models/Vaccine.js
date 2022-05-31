const mongoose = require('mongoose');

const VaccineSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dose: {
        type: Number,
        required: true
    },
    expire_month: {
        type: Number,
        required: true
    },
    creator: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Vaccine', VaccineSchema);