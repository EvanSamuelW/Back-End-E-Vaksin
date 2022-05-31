const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const Medic = require('../models/Medic');
const router = express.Router();
const auth = require('../_helpers/Authenticate');
const Status = require('../_helpers/AdminPartnerStatus');
const Role = require('../_helpers/role');


router.post('/:id', auth, async(req, res) => {
    try {
        var ObjectId = require('mongoose').Types.ObjectId;

        const room = await ChatRoom.findOne({
            transaction: new ObjectId(req.params.id)
        }).lean();

        if (!room) {
            try {
                const medic = await Medic.aggregate([{
                        $match: {
                            $and: [{
                                    partner_id: new ObjectId(req.body.partner)
                                },
                                {
                                    status: Status.Verified
                                }
                            ]
                        }
                    },
                    { $sample: { size: 1 } }
                ]);
                const chatRom = new ChatRoom({
                    transaction: req.params.id,
                    medic: medic[0].user_id,
                });
                try {
                    const saveData = await chatRom.save();
                    res.status(200).send(saveData);
                } catch (err) {
                    res.status(400).send(err);
                }

            } catch (err) {
                res.status(400).send('message: ' + err);

            }
        } else {
            res.status(200).send(room);

        }
    } catch (err) {
        res.status(400).send('message: ' + err);
    }
});




router.get('/', auth, async(req, res) => {
   var ObjectId = require('mongoose').Types.ObjectId;
    
    
    try {
        const room = await ChatRoom.aggregate([

            {
                $lookup: {
                    from: "transactions",
                    let: { transactionId: "$transaction", userId: new ObjectId(req.user.id)},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$user",'$$userId'] },
                                    { $eq: ["$_id", "$$transactionId"] }
                                ]
                            }
                        }
                    }],
                    as: 'transaction'
                }
            },
            {
                $lookup: {
                    from: 'medics',
                    localField: 'medic',
                    foreignField: 'user_id',
                    as: 'medic'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'medic.user_id',
                    foreignField: '_id',
                    as: 'medicUser'
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
                $project: {

                    medic: { $arrayElemAt: ["$medic", 0] },
                    medicUser: { $arrayElemAt: ["$medicUser", 0] },
                    transaction: { $arrayElemAt: ["$transaction", 0] },

                    schedule: { $arrayElemAt: ["$schedule", 0] },


                },
            },

        ]);
        res.json(room);
    } catch (err) {
        res.json({ message: err })
    }
});



router.get('/medic', auth, async(req, res) => {


    var ObjectId = require('mongoose').Types.ObjectId;

    try {

        const room = await ChatRoom.aggregate([{
                $match: {
                    medic: new ObjectId(req.user.id)
                }
            },

            {
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
                $project: {

                    transaction: { $arrayElemAt: ["$transaction", 0] },
                    schedule: { $arrayElemAt: ["$schedule", 0] },
                                        user: { $arrayElemAt: ["$user", 0] },



                },
            },

        ]);
        res.json(room);
    } catch (err) {
        res.json({ message: err })
    }

});

module.exports = router;