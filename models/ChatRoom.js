var mongoose = require('mongoose');

var ChatRoomSchema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Transaction"
    },
    medic: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);