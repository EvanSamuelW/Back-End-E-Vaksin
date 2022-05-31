const express = require('express');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const ScheduleStatus = require('../_helpers/ScheduleStatus');
const TransactionStatus = require('../_helpers/TransactionStatus');

const Role = require('../_helpers/role');
const Transaction = require('../models/Transaction');
const router = express.Router();
const auth = require('../_helpers/Authenticate');


router.get('/', async(req, res) => {

    try {
        const vaccination = await Schedule.aggregate([
            { $match: { status: ScheduleStatus.Published } },
            { "$unwind": { "path": "$vaccines", "preserveNullAndEmptyArrays": true } },
            {
                "$group": {
                    "_id": "$vaccines.vaccine",
                    "count": { "$sum": "$vaccines.stok" },
                }
            },
            {
                $lookup: { from: 'vaccines', localField: '_id', foreignField: '_id', as: 'vaccine' },
            },
            {
                $project: {
                    "count": 1,
                    "vaccine": { "$arrayElemAt": ["$vaccine.name", 0] }
                }
            }

        ]);

        const vaccinationResult = vaccination.map(item => ([item.vaccine, item.count]));
        vaccinationResult.unshift(["Vaccine", "Dose"]);
        // code untuk line chart user

        const user = await User.aggregate([

            {
                $match: {
                    $and: [{
                            created: {
                                $gt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                                $lte: new Date()
                            }
                        },
                        {
                            role: Role.Partner
                        }
                    ]
                }
            },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created" } }, count: { $sum: 1 } } }
        ]);

        var now = new Date();
        var date = [];
        for (var d = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); d <= now; d.setDate(d.getDate() + 1)) {
            date.push(new Date(d).toISOString().split('T')[0]);
        }
        var result = [];
        for (d of date) {
            var index = user.findIndex(data => data._id === d);
            if (index == -1) {
                result.push(0);
            } else {
                result.push(user[index].count);
            }
        }



        const admin = await User.aggregate([

            {
                $match: {
                    $and: [{
                            created: {
                                $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                $lte: new Date()
                            }
                        },
                        {
                            role: Role.User
                        }
                    ]
                }
            },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created" } }, count: { $sum: 1 } } }
        ]);

        var result2 = [];
        for (d of date) {
            var index = admin.findIndex(data => data._id === d);
            if (index == -1) {
                result2.push(0);
            } else {
                result2.push(admin[index].count);
            }
        }

        const schedule = await Schedule.aggregate([{
                $lookup: {
                    from: "transactions",
                    let: {
                        scheduleId: "$_id"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                        $eq: [
                                            "$schedule",
                                            "$$scheduleId"
                                        ]
                                    },
                                    {
                                        $eq: [
                                            "$status",
                                            TransactionStatus.Vaccinated
                                        ]
                                    }
                                ]
                            }
                        }
                    }],
                    as: "transactions"
                }
            },
            {
                $lookup: {
                    from: "partners",
                    localField: "location",
                    foreignField: "_id",
                    as: "location"
                }
            },
            {
                $set: {
                    location: {
                        $first: "$location"
                    }
                }
            },
            {
                $group: {
                    _id: "$location._id",
                    location: {
                        $first: "$location"
                    },
                    total: {
                        $sum: {
                            $size: "$transactions"
                        }
                    }
                }
            },
            {
                $sort: {
                    "total": -1
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    locationName: "$location.name",
                    total: 1
                }
            }
        ])

        const result3 = schedule.map(item => ([item.locationName, item.total]));
        result3.unshift(["Partner", "Dosis Diberikan"]);
        const dashboard = { vaccinationResult, result, result2, result3 };
        res.status(200).send(dashboard);

    } catch (err) {
        res.json({ message: err })
    }



});



module.exports = router;