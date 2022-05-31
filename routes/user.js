const express = require('express');
const User = require('../models/User');
const Role = require('../_helpers/role');
const UserStatus = require('../_helpers/UserStatus');
const bcrypt = require("bcrypt");
const auth = require('../_helpers/Authenticate');
const path = require('path')
const multer = require('multer');
var nodemailer = require('nodemailer');
const DetailUser = require('../models/DetailUser');
const AdminPartner = require('../models/AdminPartner');
const SuperAdmin = require('../models/SuperAdmin');
const Medic = require('../models/Medic');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './Images/ktp/')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})


var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'wiyendraevan@gmail.com',
        pass: 'm2112000.'
    }
});

const router = express.Router();
const upload = multer({ storage: storage });

router.post('/forgotPassword', async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).lean();
        if (user) {
            const password = Math.random().toString(36).slice(2);
            try {
                var salt = bcrypt.genSaltSync(10);
                const userSearch = await User.updateOne({ _id: user._id }, { password: bcrypt.hashSync(password, salt) });
                var mailOptions = {
                    from: 'adminevaksin@gmail.com',
                    to: req.body.email,
                    subject: 'Reset Password',
                    text: `Kata sandi sementara anda adalah ${password}`
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.status(200).send('Email sent: ' + info.response);
                    }
                });
            } catch (err) {
                res.json({ message: err });
            }

        } else {
            res.status(400).send('Pengguna tidak ditemukan');
        }
    } catch (error) {
        res.json(error);
    }
});

router.patch('/changePassword/:id', auth, async(req, res) => {


    const userSearch = await User.findOne({ _id: req.user.id }).lean()
    if (!userSearch) {
        return res.json({ status: 'error', error: 'Invalid Credential' })
    } else {
        var isMatch = bcrypt.compareSync(req.body.oldPassword, userSearch.password);
        if (isMatch) {

            try {
                var salt = bcrypt.genSaltSync(10);
                const user = await User.updateOne({ _id: req.user.id }, { password: bcrypt.hashSync(req.body.newPassword, salt) });
                res.json(user);
            } catch (err) {
                res.json({ message: err });
            }
        } else {
            return res.status(400).json({
                message: "Old Password is incorrect"
            });
        }

    }


});

router.post('/', upload.single("ktp"), async(req, res) => {
    let fileName = req.file != null ? req.file.filename : null;

    var salt = bcrypt.genSaltSync(10);
    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, salt),
        role: Role.User,
        first_name: req.body.first_name,
        last_name: req.body.last_name,

    });
    try {
        const savedUser = await user.save();

        const savedParticipant = new DetailUser({
            user_id: savedUser._id,
            nik: req.body.nik,
            phone: req.body.phone,
            address: req.body.address,
            birthday: new Date(req.body.date),
            ktp: fileName,
            coordinate: req.body.coordinate
        });
        try {
            const saveUser = await savedParticipant.save();
            res.status(200).send(saveUser);

        } catch (err) {
            res.status(400).send(err);
        }

    } catch (err) {
        res.status(400).send(err);
    }

});




router.get('/', auth, async(req, res) => {

    try {
        const userSearch = await User.findOne({ _id: req.user.id }).lean();
        if (userSearch.role == Role.User) {
            try {
                const user = await DetailUser.findOne({ user_id: req.user.id }).populate({
                    path: 'user_id'
                }).sort({ is_deleted: 1 });
                res.status(200).send(user);
            } catch (err) {
                res.status(400).send(err);
            }

        } else if (userSearch.role == Role.Partner) {
            try {
                const user = await AdminPartner.findOne({ user_id: req.user.id }).populate({
                    path: 'user_id'
                }).populate({
                    path: 'partner_id',
                    populate: {
                        path: 'category'
                    }
                }).sort({ is_deleted: 1 });
                res.status(200).send(user);
            } catch (err) {
                res.status(400).send(err);
            }
        } else if (userSearch.role == Role.Medic) {
            try {
                const user = await Medic.findOne({ user_id: req.user.id }).populate({
                    path: 'user_id'
                }).populate({
                    path: 'partner_id',
                    populate: {
                        path: 'category'
                    }
                }).sort({ is_deleted: 1 });
                res.status(200).send(user);
            } catch (err) {
                res.status(400).send(err);
            }
        } else if (userSearch.role == Role.Admin) {
            try {
                const user = await SuperAdmin.findOne({ user_id: req.user.id }).populate({
                    path: 'user_id'
                }).sort({ is_deleted: 1 });
                res.status(200).send(user);
            } catch (err) {
                res.status(400).send(err);
            }
        }


    } catch (err) {
        res.status(400).send(err);
    }


});


router.patch('/enable/:postId', auth, async(req, res) => {

    try {
        const user = await User.updateOne({ _id: req.params.postId }, { $set: { is_deleted: false } });
        res.json(user);
    } catch (err) {
        res.json({ message: err })
    }
});


router.delete('/:postId', auth, async(req, res) => {

    try {
        const user = await User.updateOne({ _id: req.params.postId }, { $set: { is_deleted: true } });
        res.json(user);
    } catch (err) {
        res.json({ message: err })
    }
});




module.exports = router;