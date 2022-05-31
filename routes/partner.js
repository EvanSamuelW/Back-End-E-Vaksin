const express = require('express');
const Partner = require('../models/Partner');
const path = require('path')
const multer = require('multer');
const PartnerStatus = require('../_helpers/PartnerStatus');
const auth = require('../_helpers/Authenticate');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
         cb(null, path.join(__dirname, '../Images/partner/'));
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

var nodemailer = require('nodemailer');
const AdminPartner = require('../models/AdminPartner');
const AdminPartnerStatus = require('../_helpers/AdminPartnerStatus');
const Schedule = require('../models/Schedule');
const ScheduleStatus = require('../_helpers/ScheduleStatus');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'wiyendraevan@gmail.com',
        pass: 'sngwjcvrhrinrttk'
    }
});
const router = express.Router();

const upload = multer({ storage: storage });
router.get('/', async(req, res) => {
    try {

        let perPages = 3;
        let filter = {};
        var ObjectId = require('mongoose').Types.ObjectId;

        if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
        if (req.query.category) filter.category = new ObjectId(req.query.category);

        const partnerCount = await Partner.find(filter).countDocuments();

        let pages = Math.ceil(partnerCount / perPages);
        let pageNumber = (req.query.page == null) ? 1 : req.query.page;

        let startFrom = (pageNumber - 1) * perPages;


        const partner = await Partner.find(filter).populate({ path: 'category' }).sort({ is_deleted: 1 }).skip(startFrom).limit(perPages).lean();
        const response = {};
        response.partner = partner;
        response.pages = pages;

        res.send(response);
    } catch (err) {
        res.json({ message: err });
    }
});

router.get('/user', async(req, res) => {
    try {

        const partner = await Schedule.aggregate([
            { $match: { status: ScheduleStatus.Published } },
            {
                "$group": {
                    "_id": "$location",
                }
            },
            {
                $lookup: { from: 'partners', localField: '_id', foreignField: '_id', as: 'partner' },
            },
            {
                $project: {
                    "partner": { "$arrayElemAt": ["$partner", 0] }
                }
            }
        ]);

        res.status(200).send(partner);
    } catch (err) {
        res.json({ message: err });
    }
});


router.post('/', upload.single("image"), async(req, res) => {
    let fileName = req.file != null ? req.file.filename : null

    const partner = new Partner({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        coordinate: req.body.coordinate,
        category: req.body.category,
        image: fileName,
        status: PartnerStatus.Not_Verified
    });
    try {
        const savedPartner = await partner.save();
        res.json(savedPartner)
    } catch (err) {
        res.json({ message: err })
    }

});



router.patch('/enable/:postId', auth, async(req, res) => {

    try {
        const partner = await Partner.updateOne({ _id: req.params.postId }, { $set: { is_deleted: false } });
        res.json(partner);
    } catch (err) {
        res.json({ message: err })
    }
});


router.patch('/verify/:postId', auth, async(req, res) => {

    try {
        const partner = await Partner.findOneAndUpdate({ _id: req.params.postId }, { $set: { status: PartnerStatus.Verified } }, { returnOriginal: false });

        try {
            const admin = await AdminPartner.updateMany({ partner_id: req.params.postId }, { $set: { status: AdminPartnerStatus.Verified } }, { returnOriginal: false });
            var mailOptions = {
                from: 'wiyendraevanl@gmail.com',
                to: partner.email,
                subject: 'Your Account is verified',
                text: 'You can now login to E-vaksin website'
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    res.status(400).send('Error: ' + error);
                } else {
                    res.status(200).send('Email sent: ' + info.response);
                }
            });
        } catch (err) {
            res.json({ message: err })
        }

    } catch (err) {
        res.json({ message: err })
    }
});

router.get('/:postId', async(req, res) => {

    try {
        const partner = await Partner.findById(req.params.postId);
        res.json(partner);
    } catch (err) {
        res.json({ message: err })
    }
});

router.delete('/:postId', auth, async(req, res) => {

    try {
        const partner = await Partner.updateOne({ _id: req.params.postId }, { $set: { is_deleted: true } });
        res.json(partner);
    } catch (err) {
        res.json({ message: err })
    }
});

router.put('/:postId', upload.single("image"), auth, async(req, res) => {
    let fileName = req.file != null ? req.file.filename : null

    var objForUpdate = {};

    if (req.body.name) objForUpdate.name = req.body.name;
    if (req.body.phone) objForUpdate.phone = req.body.phone;
    if (req.body.email) objForUpdate.email = req.body.email;
    if (req.body.address) objForUpdate.address = req.body.address;
    if (req.body.category) objForUpdate.category = req.body.category;
    if (req.body.coordinate != []) objForUpdate.coordinate = req.body.coordinate;
    if (fileName) objForUpdate.image = fileName;

    var ObjectId = require('mongoose').Types.ObjectId;
    objForUpdate = { $set: objForUpdate }
    try {
        const partner = await Partner.updateOne({ _id: new ObjectId(req.params.postId) }, objForUpdate);
        res.status(200).json(partner);
    } catch (err) {
        res.status(400).json({ message: err })
    }
});





module.exports = router;