const express = require('express');
const Vaccine = require('../models/Vaccine');
const router = express.Router();
const auth = require('../_helpers/Authenticate');


router.get('/', async(req, res) => {
    try {
        const vaccine = await Vaccine.find().populate("creator", "-password")
            .sort({ is_deleted: 1 }).
        lean();

        for (let i = 0; i < vaccine.length; i++) {
            vaccine[i].creator.full_name = vaccine[i].creator.first_name + " " + vaccine[i].creator.last_name;

        }
        res.json(vaccine);
    } catch (err) {
        res.json({ message: err });
    }
});

router.get('/active', async(req, res) => {
    try {
        const vaccine = await Vaccine.find({ is_deleted: false });
        res.json(vaccine);
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/', auth, async(req, res) => {
    const vaccine = new Vaccine({
        name: req.body.name,
        description: req.body.description,
        creator: req.user.id,
        dose: req.body.dose,
        manufacturer: req.body.manufacturer,
        expire_month: req.body.expire_month,
    });
    try {
        const savedVaccine = await vaccine.save();
        res.json(savedVaccine)
    } catch (err) {
        res.json({ message: err })
    }

});

router.patch('/enable/:postId', auth, async(req, res) => {

    try {
        const vaccine = await Vaccine.updateOne({ _id: req.params.postId }, { $set: { is_deleted: false } });
        res.json(vaccine);
    } catch (err) {
        res.json({ message: err })
    }
});

router.get('/:postId', async(req, res) => {

    try {
        const vaccine = await Vaccine.findById(req.params.postId);
        res.json(vaccine);
    } catch (err) {
        res.json({ message: err })
    }
});

router.delete('/:postId', auth, async(req, res) => {

    try {
        const vaccine = await Vaccine.updateOne({ _id: req.params.postId }, { $set: { is_deleted: true } });
        res.json(vaccine);
    } catch (err) {
        res.json({ message: err })
    }
});

router.put('/:postId', auth, async(req, res) => {

    try {
        var objForUpdate = {};

        if (req.body.name) objForUpdate.name = req.body.name;
        if (req.body.description) objForUpdate.description = req.body.description;
        if (req.body.manufacturer) objForUpdate.manufacturer = req.body.manufacturer;
        if (req.body.dose) objForUpdate.dose = req.body.dose;
        if (req.body.expire_month) objForUpdate.expire_month = req.body.expire_month;

        objForUpdate = { $set: objForUpdate }
        const vaccine = await Vaccine.updateOne({ _id: req.params.postId }, objForUpdate);
        res.json(vaccine);
    } catch (err) {
        res.json({ message: err })
    }
});

module.exports = router;