const mongoose = require('mongoose');

const ScheduleSchema = mongoose.Schema({
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: false,
    },
    is_lansia: {
        type: Boolean,
        default: false,
    },
    location: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Partner"
    },
    vaccines: [{
        vaccine: {
            type: mongoose.Schema.ObjectId,
            require: true,
            ref: "Vaccine"
        },
        stok: {
            type: Number,
            required: true
        }
    }],
    created: {
        type: Date,
        default: Date.now
    },
    creator: {
        type: mongoose.Schema.ObjectId,
        required: false,
        ref: "User",
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
    age: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Schedule', ScheduleSchema);