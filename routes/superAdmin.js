const express = require('express');
const Admin = require('../models/SuperAdmin');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require("bcrypt");
const Role = require('../_helpers/role');
const auth = require('../_helpers/Authenticate');



router.get('/', auth, async(req, res) => {
    try {
        const admin = await Admin.find().populate("user_id", "-password").lean();

        for (let i = 0; i < admin.length; i++) {
            admin[i].user_id.full_name = admin[i].user_id.first_name + " " + admin[i].user_id.last_name;
        }
        res.status(200).send(admin);
    } catch (err) {
        res.status(400).send({ message: err });
    }

});
router.post('/', async(req, res) => {

    var salt = bcrypt.genSaltSync(10);
    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, salt),
        role: Role.Admin,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        is_deleted: false,
    });

    try {
        const savedUser = await user.save();
        const savedAdminPartner = new Admin({
            user_id: savedUser._id,
            join_date: new Date(req.body.date),
            position: req.body.position,
            is_active: true
        });
        try {
            const saveAdmin = await savedAdminPartner.save();
            res.status(200).send(saveAdmin);

        } catch (err) {
            res.status(400).send(err);
        }

    } catch (err) {
        res.status(400).send(err);
    }

});

router.delete('/:id', auth, async(req, res) => {

    try {
        const admin = await Admin.updateOne({ _id: req.params.id }, { $set: { is_active: false } });
        res.json(admin);
    } catch (err) {
        res.json({ message: err })
    }
});

router.patch('/enable/:postId', auth, async(req, res) => {

    try {
        const admin = await Admin.updateOne({ _id: req.params.id }, { $set: { is_active: true } });
        res.json(admin);
    } catch (err) {
        res.json({ message: err })
    }
});

router.patch('/:id', auth, async(req, res) => {


    var objForUpdate = {};
    var objUser = {};
 var ObjectId = require('mongoose').Types.ObjectId;

    if (req.body.position) objForUpdate.position = req.body.position;
    if (req.body.date) objForUpdate.join_date = new Date(req.body.date);

    if(req.body.first_name) objUser.first_name = req.body.first_name;
    if(req.body.last_name) objUser.last_name = req.body.last_name;
    if(req.body.email) objUser.email = req.body.email;
    
    objForUpdate = { $set: objForUpdate }
    try {
        const user = await Admin.updateOne({ _id: req.params.id }, objForUpdate);
         if (objUser != {}) {
            objUser = { $set: objUser };
            try {
                const user2 = await User.updateOne({ _id: new ObjectId(req.body.user_id) }, objUser);
                res.json(user2);

            } catch (err) {
        res.status(400).send({ message: err })

            }
        }
        res.json(user);
    } catch (err) {
        res.json({ message: err })
    }
});


module.exports = router;