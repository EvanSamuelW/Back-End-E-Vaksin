const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();
const ScheduleStatus = require('../_helpers/ScheduleStatus');
const auth = require('../_helpers/Authenticate');



router.get('/:id', async(req, res) => {
    try {
        var ObjectId = require('mongoose').Types.ObjectId;
        const schedule = await Schedule.find({
            location: new ObjectId(req.params.id)
        }).populate({ path: 'creator' }).populate({ path: 'vaccines.vaccine' }).lean();
        const length = schedule.length;
        for (let i = 0; i < length; i++) {
            if(new Date().getTime() > new Date(schedule[i].end).getTime())
            {
                schedule[i].status = ScheduleStatus.Ended
            }
        }
        res.status(200).send(schedule);
    } catch (err) {
        res.status(400).send('message: ' + err);
    }
});

router.get('/count/:id', async(req, res) => {
    var ObjectId = require('mongoose').Types.ObjectId;

    try {
        const schedule = await Schedule.aggregate([{
                $match: {
                    $and: [{
                            status: ScheduleStatus.Published
                        },
                        {
                            _id: new ObjectId(req.params.id),
                        }
                    ]
                }
            },
            {
                "$lookup": {
                    "from": "transactions",
                    "localField": "_id",
                    "foreignField": "schedule",
                    "as": "transactions"
                }
            },


            {
                $project: {
                    vaccines: 1,
                    schedule: "$_id",
                    transactions: 1,
                    total: {
                        $subtract: [{
                                $sum: "$vaccines.stok"
                            },
                            {
                                $size: "$transactions"
                            }
                        ]
                    },

                }
            },


        ]);
        const vaccineSchedule = schedule[0].vaccines.map(data => data.vaccine);

        for (let i = 0; i < schedule[0].transactions.length; i++) {
            for (let j = 0; j < vaccineSchedule.length; j++) {
                if (vaccineSchedule[j] != null && schedule[0].transactions[i].vaccine != null && schedule[0].transactions[i].vaccine.toString() == vaccineSchedule[j].toString()) {
                    schedule[0].vaccines[j].stok -= 1;
                }

            }
        }

        res.json(schedule);


    } catch (err) {
        res.status(400).send('message: ' + err);
    }
});


router.get('/user/:id', async(req, res) => {
    try {
        let params = {};
       

        if (req.query.vaksin != undefined) {

            if (req.query.vaksin == '1') {
                params.vaksin1 = true;

            } else if (req.query.vaksin == '2') {
                params.vaksin2 = true;

            } else {
                params.vaksinBooster = true;
            }

        }
        
        var ObjectId = require('mongoose').Types.ObjectId;
        const schedule = await Schedule.aggregate([{
                $match: {

                    $and: [{
                            status: ScheduleStatus.Published
                        },
                        {
                            location: new ObjectId(req.params.id),
                        },
                       
                        params
                    ],
                }
            },
            {
                "$lookup": {
                    "from": "transactions",
                    "localField": "_id",
                    "foreignField": "schedule",
                    "as": "transactions"
                }
            },

            {
                $project: {
                    vaccines: 1,
                    vaksin1: 1,
                    vaksin2: 1,
                    start: 1,
                    end: 1,
                    age: 1,
                    vaksinBooster: 1,
                    schedule: "$_id",

                    total: {
                        $subtract: [{
                                $sum: "$vaccines.stok"
                            },
                            {
                                $size: "$transactions"
                            }
                        ]
                    },

                }
            },

        ])

        const result = await Schedule.populate(schedule, { path: 'vaccines.vaccine' });
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send('message: ' + err);
    }
});
router.post('/', auth, async(req, res) => {

    const date1 = new Date(new Date(req.body.start));
    const formattedDate = new Date(date1.setHours(date1.getHours() + 7));
    const date2 = new Date(new Date(req.body.end));
    const formattedDate2 = new Date(date2.setHours(date2.getHours() + 7));
    const schedule = new Schedule({
        start: formattedDate,
        end: formattedDate2,
        is_lansia: req.body.is_lansia,
        location: req.body.location,
        vaccines: req.body.vaccines,
        creator: req.user.id,
        status: req.body.status,
        age: req.body.age
    });
    try {
        const saveSchedule = await schedule.save();
        res.status(200).send(saveSchedule);
    } catch (err) {
        res.status(400).send(err);
    }

});

router.put('/:id', auth, async(req, res) => {
    var objForUpdate = {};
    if (req.body.start) {
        const date1 = new Date(new Date(req.body.start));
        const formattedDate = new Date(date1.setHours(date1.getHours() + 7));
        objForUpdate.start = formattedDate;
    }
    if (req.body.end) {
        const date2 = new Date(new Date(req.body.end));
        const formattedDate2 = new Date(date2.setHours(date2.getHours() + 7));
        objForUpdate.end = formattedDate2;
    }
    if (req.body.is_lansia != null) objForUpdate.is_lansia = req.body.is_lansia;
    if (req.body.vaccines) objForUpdate.vaccines = req.body.vaccines;
    if (req.body.vaksin1) objForUpdate.vaksin1 = req.body.vaksin1;
    if (req.body.vaksin2) objForUpdate.vaksin2 = req.body.vaksin2;
    if (req.body.vaksinBooster) objForUpdate.vaksinBooster = req.body.vaksinBooster;
    if (req.body.age) objForUpdate.age = req.body.age;
    if (req.body.status) objForUpdate.status = req.body.status;
    objForUpdate = { $set: objForUpdate }
    try {
        const schedule = await Schedule.updateOne({ _id: req.params.id }, objForUpdate);
        res.json(schedule);
    } catch (err) {
        res.json({ message: err })
    }
})

router.delete('/:id', auth, async(req, res) => {

    try {
        var ObjectId = require('mongoose').Types.ObjectId;
        const schedule = await Schedule.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: ScheduleStatus.Deleted } });
        res.json(schedule);
    } catch (err) {
        res.json({ message: err })
    }
});

module.exports = router;