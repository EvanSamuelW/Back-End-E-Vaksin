const mongoose = require('mongoose');

const TransactionSchema = mongoose.Schema({
    schedule: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Schedule"
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    uniqueCode: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    vaccine: {
        type: mongoose.Schema.ObjectId,
        required: false,
        default: null,
        ref: "Vaccine"
    },
    modified: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        required: false
    },
    vaksin1: {
        type: Boolean,
        default: false,
    },
    vaksin2: {
        type: Boolean,
        default: false,
    },
    vaksinBooster: {
        type: Boolean,
        default: false,
    },
})

module.exports = mongoose.model('Transaction', TransactionSchema);