const express = require('express');
const Medic = require('../models/Medic');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require("bcrypt");
const Role = require('../_helpers/role');
const Status = require('../_helpers/AdminPartnerStatus');
const auth = require('../_helpers/Authenticate');



router.get('/:PartnerId', auth, async(req, res) => {
    try {
        var ObjectId = require('mongoose').Types.ObjectId;
        const medic = await Medic.find().and([
            { partner_id: new ObjectId(req.params.PartnerId) },
        ]).populate({
            path: 'user_id'
        }).lean();

        var length = medic.length;
        for (let i = 0; i < length; i++) {
            medic[i].user_id.full_name = medic[i].user_id.first_name + " " + medic[i].user_id.last_name;
        }
        res.status(200).send(medic);
    } catch (err) {
        res.status(400).send({ message: err });
    }

});
router.post('/', async(req, res) => {

    var salt = bcrypt.genSaltSync(10);


    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, salt),
        role: Role.Medic,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        is_deleted: false,
    });

    try {
        const savedUser = await user.save();
        const savedMedic = new Medic({
            user_id: savedUser._id,
            join_date: new Date(req.body.date),
            partner_id: req.body.partner_id,
            education: req.body.education,
            position: req.body.position,
            status: Status.Not_Verified
        });
        try {
            const saveMedic = await savedMedic.save();
            res.status(200).send(saveMedic);

        } catch (err) {
            res.status(400).send(err);
        }

    } catch (err) {
        res.status(400).send(err);
    }

});

router.delete('/:id', auth, async(req, res) => {

    try {
        const medic = await Medic.updateOne({ _id: req.params.id }, { $set: { status: Status.Deleted } });
        res.json(medic);
    } catch (err) {
        res.json({ message: err })
    }
});

router.patch('/enable/:postId', auth, async(req, res) => {

    try {
        const medic = await Medic.updateOne({ _id: req.params.postId }, { $set: { status: Status.Verified } });
        res.json(medic);
    } catch (err) {
        res.json({ message: err })
    }
});

router.patch('/:id', auth, async(req, res) => {
  let objForUpdate = {};
    let objUser = {};
    const ObjectId = require('mongoose').Types.ObjectId;

    if (req.body.position) objForUpdate.position = req.body.position;
    if (req.body.education) objForUpdate.education = req.body.education;
    if (req.body.date) objForUpdate.join_date = new Date(req.body.date);
    if (req.body.email) objUser.email = req.body.email;
    if (req.body.first_name) objUser.first_name = req.body.first_name;
    if (req.body.last_name) objUser.last_name = req.body.last_name;

    objForUpdate = { $set: objForUpdate }
    try {
        const user = await Medic.updateOne({ _id: req.params.id }, objForUpdate);
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