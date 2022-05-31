const express = require('express');
const Complain = require('../models/Complain');
const router = express.Router();
const role = require('../_helpers/role');
const auth = require('../_helpers/Authenticate');

const excel = require("exceljs");


router.get('/:partnerId', auth, async(req, res) => {
    try {
        const complain = await Complain.aggregate([{
                $lookup: {
                    from: "transactions",
                    localField: 'transaction',
                    foreignField: '_id',
                    as: 'transaction'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'transaction.user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'transaction.schedule',
                    foreignField: '_id',
                    as: 'schedule'
                }
            },
            {
                $lookup: {
                    from: 'partners',
                    localField: 'schedule.location',
                    foreignField: '_id',
                    as: 'partner'
                }
            },
            {
                $lookup: {
                    from: 'detailusers',
                    localField: 'transaction.user',
                    foreignField: 'user_id',
                    as: 'detailUser'
                }
            },
            {
                $lookup: {
                    from: "vaccines",
                    localField: 'transaction.vaccine',
                    foreignField: '_id',
                    as: 'vaccine'
                }
            },
            {
                $project: {
                    "created": 1,
                    "complain": 1,
                    user: { $arrayElemAt: ["$user", 0] },
                    transaction: { $arrayElemAt: ["$transaction", 0] },
                    detailUser: { $arrayElemAt: ["$detailUser", 0] },
                    partner: { $arrayElemAt: ["$partner", 0] },
                    vaccine: { $arrayElemAt: ["$vaccine.name", 0] },
                    modified: { $arrayElemAt: ["$transaction.modified", 0] },

                    first_name: { $arrayElemAt: ["$user.first_name", 0] },
                    last_name: { $arrayElemAt: ["$user.last_name", 0] },
                    email: { $arrayElemAt: ["$user.email", 0] },
                    address: { $arrayElemAt: ["$detailUser.address", 0] },
                    nik: { $arrayElemAt: ["$detailUser.nik", 0] },
                    phone: { $arrayElemAt: ["$detailUser.phone", 0] },
                    birthday: { $arrayElemAt: ["$detailUser.birthday", 0] },

                },
            },
            {
                $project: {
                    "user.password": 0,
                }
            }
        ]);
        let result = [];
        result = complain;
        if (req.user.role == role.Partner) {
            const complainFilter = complain.filter(function(itm) {
                return String(itm.partner._id) == String(req.params.partnerId);
            });

            result = complainFilter;
        }

        res.status(200).send(result);
    } catch (err) {
        res.status(400).send('message: ' + err);
    }
});


router.get('/export/:partnerId', auth, async(req, res) => {
    try {
        const complain = await Complain.aggregate([{
                $lookup: {
                    from: "transactions",
                    localField: 'transaction',
                    foreignField: '_id',
                    as: 'transaction'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'transaction.user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'transaction.schedule',
                    foreignField: '_id',
                    as: 'schedule'
                }
            },
            {
                $lookup: {
                    from: 'partners',
                    localField: 'schedule.location',
                    foreignField: '_id',
                    as: 'partner'
                }
            },
            {
                $lookup: {
                    from: 'detailusers',
                    localField: 'transaction.user',
                    foreignField: 'user_id',
                    as: 'detailUser'
                }
            },
            {
                $lookup: {
                    from: "vaccines",
                    localField: 'transaction.vaccine',
                    foreignField: '_id',
                    as: 'vaccine'
                }
            },
            {
                $project: {
                    "created": 1,
                    "complain": 1,
                    user: { $arrayElemAt: ["$user", 0] },
                    transaction: { $arrayElemAt: ["$transaction", 0] },
                    detailUser: { $arrayElemAt: ["$detailUser", 0] },
                    partner: { $arrayElemAt: ["$partner", 0] },
                    vaccine: { $arrayElemAt: ["$vaccine.name", 0] },
                    modified: { $arrayElemAt: ["$transaction.modified", 0] },

                    first_name: { $arrayElemAt: ["$user.first_name", 0] },
                    last_name: { $arrayElemAt: ["$user.last_name", 0] },
                    email: { $arrayElemAt: ["$user.email", 0] },
                    address: { $arrayElemAt: ["$detailUser.address", 0] },
                    nik: { $arrayElemAt: ["$detailUser.nik", 0] },
                    phone: { $arrayElemAt: ["$detailUser.phone", 0] },
                    birthday: { $arrayElemAt: ["$detailUser.birthday", 0] },

                },
            },
            {
                $project: {
                    "user.password": 0,
                }
            }
        ]);

        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("Complains");
        worksheet.columns = [
            { header: "Id", key: "_id", width: 30 },
            { header: "First Name", key: "first_name", width: 10 },
            { header: "Last Name", key: "last_name", width: 10 },
            { header: "Email", key: "email", width: 25 },
            { header: "Phone", key: "phone", width: 20 },
            { header: "NIK", key: "nik", width: 20 },
            { header: "address", key: "address", width: 125 },
            { header: "birthday", key: "birthday", width: 20 },
            { header: "vaccine", key: "vaccine", width: 10 },
            { header: "Vaccinated at", key: 'modified', width: 20 },
            { header: "Complain", key: "complain", width: 30 },
            { header: "Created at", key: "created", width: 20 },



        ];

        if (req.user.role == role.Partner) {
            let complainFilter = complain.filter(function(itm) {
                return String(itm.partner._id) == String(req.params.partnerId);
            });
            worksheet.addRows(complainFilter);

        } else {
            worksheet.addRows(complain);
        }
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "complains.xlsx"
        );
        return workbook.xlsx.write(res).then(function() {
            res.status(200).end();
        });
    } catch (err) {
        res.status(400).send('message: ' + err);
    }
});






router.post('/', auth, async(req, res) => {
    const date1 = new Date();
    const formattedDate = new Date(date1.setHours(date1.getHours() + 7));
    const complain = new Complain({
        transaction: req.body.transaction,
        user: req.user.id,
        complain: req.body.complain,
        created: formattedDate
    });
    try {
        const saveData = await complain.save();
        res.status(200).send(saveData);
    } catch (err) {
        res.status(400).send(err);
    }

});

module.exports = router;