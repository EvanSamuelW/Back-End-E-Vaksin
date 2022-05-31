const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();
const auth = require('../_helpers/Authenticate');
const role = require('../_helpers/role');
const DetailUser = require('../models/DetailUser');
const transactionStatus = require('../_helpers/TransactionStatus');
const excel = require("exceljs");

router.post('/', auth, async(req, res) => {


    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const schedule = new Transaction({
        schedule: req.body.schedule,
        uniqueCode: random,
        user: req.user.role == role.Partner ? req.body.user : req.user.id,
        status: 'Active',
        vaksin1: req.body.vaksin1,
        vaksin2: req.body.vaksin2,
        vaksinBooster: req.body.vaksinBooster,

    });
    try {
        const saveSchedule = await schedule.save();
        res.status(200).send(saveSchedule);

    } catch (err) {
        res.status(400).send(err);
    }

});
Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
}
router.patch('/update/:id', auth, async(req, res) => {
var ObjectId = require('mongoose').Types.ObjectId;
    try {
        let objForUpdate = {};
         let objUser = {};
          
        if (req.body.status) objForUpdate.status = req.body.status;
        if (req.body.vaccine) {
            objForUpdate.vaccine = req.body.vaccine;
            objForUpdate.modified = new Date().addHours(7);
           
        }

        objForUpdate = { $set: objForUpdate }

        const transaction = await Transaction.updateOne({ _id: req.params.id }, objForUpdate);
        try
        {
            if(req.body.vaksin1 == true)
            {
                objUser.vaksin1 = true;
            }
            else if(req.body.vaksin2 == true)
            {
                objUser.vaksin2 = true;
            }
            else
            {
                objUser.vaksinBooster == true;
            }
            objUser = {$set: objUser};
            const detailUser = await DetailUser.updateOne({_id:new ObjectId(req.body.userId)},objUser);
               res.json(detailUser);
        }catch(err)
        {
            res.json({message: err})
        }
     
    } catch (err) {
        res.json({ message: err })
    }
});
router.get('/', auth, async(req, res) => {
        var ObjectId = require('mongoose').Types.ObjectId;

    try {

         const transaction = await Transaction.aggregate([
             {
                 $match:{
                       user: new ObjectId(req.user.id) 
                 }
             },
                {
                $lookup: {
                    from: 'questionanswers',
                    localField: '_id',
                    foreignField: 'transaction',
                    as: 'answer'
                }
            },
                {
                $lookup: {
                    from: 'complains',
                    localField: '_id',
                    foreignField: 'transaction',
                    as: 'complain'
                }
            },
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'schedule',
                    foreignField: '_id',
                    as: 'schedule'
                }
            },
          
             {
                $lookup: {
                    from: 'partners',
                    localField: 'schedule.location',
                    foreignField: '_id',
                    as: 'location'
                }
            },

            {
                $project: {

                    answer: { $arrayElemAt: ["$answer", 0] },
                     complain: { $arrayElemAt: ["$complain", 0] },
                    location: { $arrayElemAt: ["$location", 0] },
                    schedule: { $arrayElemAt: ["$schedule", 0] },
                    uniqueCode: 1,
                    vaksin1: 1,
                    vaksin2: 1,
                    vaksinBooster: 1,
                    status: 1

                },
            },

        ]);
        res.json(transaction);
    } catch (err) {
        res.json({ message: err });
    }
})

router.post('/scan/:id', auth, async(req, res) => {
    try {
        const transaction = await Transaction.aggregate([{
                $match: {
                    uniqueCode: req.params.id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'detailusers',
                    localField: 'user._id',
                    foreignField: 'user_id',
                    as: 'detailUser'
                }
            },
            {
                $project: {
                    "_id": 1,
                    "status": 1,
                  
                    user: { $arrayElemAt: ["$user", 0] },
                                        testresult: { $arrayElemAt: ["$testresult", 0] },

                    detailUser: { $arrayElemAt: ["$detailUser", 0] },

                },
            },
            {
                $project: {
                    "user.password": 0,
                }
            }
        ]);
        
        if (transaction[0].status == transactionStatus.Active && transaction[0]!=null) {
            res.status(200).json(transaction[0]);
        } else {
            res.status(400).json({ message: 'QR Code tidak valid' });
        }


    } catch (err) {
        res.json({ message: err });
    }
})


router.get('/participant/:id', async(req, res) => {
    try {
        var ObjectId = require('mongoose').Types.ObjectId;

        const participant = await Transaction.aggregate([{
                $match: {
                    schedule: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'detailusers',
                    localField: 'user._id',
                    foreignField: 'user_id',
                    as: 'detailUser'
                }
            },
                {
                $lookup: {
                    from: 'testresults',
                    localField: '_id',
                    foreignField: 'transaction',
                    as: 'testresult'
                }
            },
            {
                $project: {
                    "uniqueCode": 1,
                    "status": 1,
                    "vaksin1": 1,
                    "vaksinBooster": 1,
                    "vaksin2": 1,
                  
                    user: { $arrayElemAt: ["$user", 0] },
                                        testresult: { $arrayElemAt: ["$testresult", 0] },

                    detailUser: { $arrayElemAt: ["$detailUser", 0] },

                },
            },
            {
                $project: {
                    "user.password": 0,
                }
            }
        ]);
        res.json(participant);


    } catch (err) {
        res.json({ message: err });
    }
})

router.get('/participant/export/:id', auth, async(req, res) => {
    try {
        var ObjectId = require('mongoose').Types.ObjectId;
        const participant = await Transaction.aggregate([{
                $match: {
                    schedule: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: "vaccines",
                    localField: 'vaccine',
                    foreignField: '_id',
                    as: 'vaccine'
                }
            },
            {
                $lookup: {
                    from: 'detailusers',
                    localField: 'user._id',
                    foreignField: 'user_id',
                    as: 'detailUser'
                }
            },
            {
                $project: {
                    "uniqueCode": 1,
                    "status": 1,
                    "vaksin1": 1,
                    "vaksinBooster": 1,
                    "vaksin2": 1,
                    vaccine: { $arrayElemAt: ["$vaccine.name", 0] },
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
        let worksheet = workbook.addWorksheet("Participant");
        worksheet.columns = [
            { header: "Id", key: "_id", width: 30 },
            { header: "First Name", key: "first_name", width: 10 },
            { header: "Last Name", key: "last_name", width: 10 },
            { header: "Email", key: "email", width: 25 },
            { header: "Phone", key: "phone", width: 20 },
            { header: "NIK", key: "nik", width: 20 },
            { header: "address", key: "address", width: 125 },
            { header: "birthday", key: "birthday", width: 20 },
            { header: "status", key: "status", width: 10 },
            { header: "vaccine", key: "vaccine", width: 10 },
        ];
        worksheet.addRows(participant);
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "participant.xlsx"
        );
        return workbook.xlsx.write(res).then(function() {
            res.status(200).end();
        });

    } catch (err) {
        res.json({ message: err });
    }
})

module.exports = router;