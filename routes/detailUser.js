const express = require('express');
const DetailUser = require('../models/DetailUser');
const router = express.Router();
const auth = require('../_helpers/Authenticate');
const multer = require('multer');
const User = require('../models/User');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../Images/ktp/'));
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})


const upload = multer({ storage: storage });

router.put('/:id', upload.single("ktp"), auth, async(req, res) => {
    let fileName = req.file != null ? req.file.filename : null
            var ObjectId = require('mongoose').Types.ObjectId;


    var objForUpdate = {};
    var objUser = {};

    if (req.body.nik) objForUpdate.nik = req.body.nik;
    if (req.body.phone) objForUpdate.phone = req.body.phone;
    if (req.body.date) objForUpdate.birthday = req.body.birthday;
    if (req.body.address) objForUpdate.address = req.body.address;
    if (req.body.coordinate != []) objForUpdate.coordinate = req.body.coordinate;
     if (req.body.birthday != []) objForUpdate.birthday = new Date(req.body.birthday);
    if (req.body.email) objUser.email = req.body.email;
    if (req.body.first_name) objUser.first_name = req.body.first_name;
    if (req.body.last_name) objUser.last_name = req.body.last_name;
    if (fileName) objForUpdate.ktp = fileName;


    objForUpdate = { $set: objForUpdate }
    try {
        const user = await DetailUser.updateOne({ _id: req.params.id }, objForUpdate);
        if (objUser != {}) {
            objUser = { $set: objUser };
            try {
                const user2 = await User.updateOne({ _id: new ObjectId(req.body.user_id) }, objUser);
                res.json(user2);

            } catch (err) {
                res.status(400).send(err);

            }
        }

        res.json(user);
    } catch (err) {
        res.json({ message: err })
    }
});

router.get('/', auth, async(req, res) => {
    try {
        const user = await DetailUser.find().populate({
            path: 'user_id'
        }).sort({ is_deleted: 1 });
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
})

router.delete('/:id', auth, async(req, res) => {

    try {
        const user = await DetailUser.updateOne({ _id: req.params.id }, { $set: { is_deleted: true } });
        res.json(user);
    } catch (err) {
        res.json({ message: err })
    }
});

router.patch('/enable/:postId', auth, async(req, res) => {

    try {
        const user = await DetailUser.updateOne({ _id: req.params.postId }, { $set: { is_deleted: false } });
        res.json(user);
    } catch (err) {
        res.json({ message: err })
    }
});
module.exports = router;