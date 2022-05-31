const mongoose = require('mongoose');

const PartnerSchema = mongoose.Schema({
    image: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        validate: /^\d{10}$/
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Category"

    },
    coordinate: {
        type: Array,
        default: [Number]
    },
    status: {
        type: String,
        required: true
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

module.exports = mongoose.model('Partner', PartnerSchema);