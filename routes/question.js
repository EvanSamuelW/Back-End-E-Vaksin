const express = require('express');
const Question = require('../models/Question');
const QuestionAnswer = require('../models/QuestionAnswer');
const DetailUser = require('../models/DetailUser');
const auth = require('../_helpers/Authenticate');
const router = express.Router();

router.post('/', auth, async(req, res) => {


    const question = new Question({
        questions: req.body.questions,
        is_lansia: req.body.is_lansia,
        schedule: req.body.schedule
    });
    try {
        const saveQuestion = await question.save();
        res.json(saveQuestion);
    } catch (err) {
        res.json({ message: err })
    }

});


router.get('/:Schedule', auth, async(req, res) => {
    try {
        var ObjectId = require('mongoose').Types.ObjectId;

        const question = await Question.find({ schedule: new ObjectId(req.params.Schedule), is_deleted: false }).lean();
        res.json(question);
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/answer/:id', auth, async(req, res) => {
    const question = new QuestionAnswer({
        answer: req.body.answer,
        question: req.params.id,
        user: req.user.id,
        transaction: req.body.transaction
    });
    try {
        const saveAnswer = await question.save();
        res.json(saveAnswer);
    } catch (err) {
        res.json({ message: err })
    }
});


router.post('/admin/answer/:id', auth, async(req, res) => {

    try {
        var ObjectId = require('mongoose').Types.ObjectId;

        const question = await QuestionAnswer.findOne({ user: new ObjectId(req.body.id), transaction: new ObjectId(req.body.transaction) }).populate({
            path: "question",
            match: { schedule: new ObjectId(req.params.id) }
        });
        res.json(question);
    } catch (err) {
        res.json({ message: err })
    }
});
router.get('/user/:id', auth, async(req, res) => {
    try {
        const user = await DetailUser.findOne({ user_id: req.user.id }).lean();
        try {
            var ObjectId = require('mongoose').Types.ObjectId;
            let question = await Question.find({ schedule: new ObjectId(req.params.id), is_deleted: false }).lean();
            var questionUmum = question.filter(function(itm) {
                return itm.is_lansia == false;
            });
            if (getAge(user.birthday.toString()) >= 60) {
                var questionLansia = question.filter(function(itm) {
                    return itm.is_lansia == true;
                });

                if (questionLansia.length == 0) {

                    res.status(200).json(questionUmum[0]);
                } else {
                    res.status(200).json(questionLansia[0]);
                }
            }
            res.status(200).json(questionUmum[0]);



        } catch (err) {
            res.json({ message: err });

        }

    } catch (err) {
        res.json({ message: err });
    }
});


router.delete('/:id', auth, async(req, res) => {

    try {
        const question = await Question.updateOne({ _id: req.params.id }, { $set: { is_deleted: true } });
        res.json(question);
    } catch (err) {
        res.json({ message: err })
    }
});

router.put('/:id', auth, async(req, res) => {


    var objForUpdate = {};

    if (req.body.questions) objForUpdate.questions = req.body.questions;
    if (req.body.is_lansia) objForUpdate.is_lansia = req.body.is_lansia;


    var ObjectId = require('mongoose').Types.ObjectId;
    objForUpdate = { $set: objForUpdate }
    try {
        const question = await Question.updateOne({ _id: new ObjectId(req.params.id) }, objForUpdate);
        res.status(200).json(question);
    } catch (err) {
        res.status(400).json({ message: err })
    }
});

function getAge(dateString) {
    var ageInMilliseconds = new Date() - new Date(dateString);
    return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365); // convert to years
}
module.exports = router;