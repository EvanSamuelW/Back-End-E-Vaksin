const mongoose = require('mongoose');

const TestResultSchema = mongoose.Schema({
    transaction: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Transaction"
    },
    blood: {
        type: String,
        required: true
    },
    temp: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('TestResult', TestResultSchema);