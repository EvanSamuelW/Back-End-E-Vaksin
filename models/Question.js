const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
    questions: {
        type: Array,
        required: true,
        default: []
    },
    is_lansia: {
        type: Boolean,
        required: false,
    },
    schedule: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Schedule"
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

module.exports = mongoose.model('Question', QuestionSchema);