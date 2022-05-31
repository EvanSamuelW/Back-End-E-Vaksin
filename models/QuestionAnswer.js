const mongoose = require('mongoose');

const QuestionAnswerSchema = mongoose.Schema({
    answer: {
        type: Array,
        required: true,
        default: []
    },
    question: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Question"
    },
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
    created: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema);