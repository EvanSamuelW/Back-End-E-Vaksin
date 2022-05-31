const mongoose = require('mongoose');
const UserStatus = require('../_helpers/UserStatus');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        // validate: {
        //     validator: async function(email) {
        //         const user = await this.constructor.findOne({ email });
        //         if (user) {
        //             if (this.id === user.id) {
        //                 return true;
        //             }
        //             return false;
        //         }
        //         return true;
        //     },
        //     message: props => 'The specified email address is already in use.'
        // }
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('User', UserSchema);