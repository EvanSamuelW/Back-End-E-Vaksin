const mongoose = require('mongoose');

const ComplainSchema = mongoose.Schema({
    transaction: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Transaction"
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    complain: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Complain', ComplainSchema);