const mongoose = require('mongoose');

const DetailUserSchema = mongoose.Schema({
    nik: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        // validate: /^\d{10}$/

    },
    address: {
        type: String,
        required: true
    },
    ktp: {
        type: String,
        required: false
    },
    birthday: {
        type: Date,
        required: true
    },
    coordinate: {
        type: Array,
        default: []
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
    },
    is_deleted: {
        type: Boolean,
        required: true,
        default: false
    },
      vaksin1: {
        type: Boolean,
        default: false
    },
      vaksin2: {
        type: Boolean,
        default: false
    },
      vaksinBooster: {
        type: Boolean,
        default: false
    },

})

module.exports = mongoose.model('DetailUser', DetailUserSchema);