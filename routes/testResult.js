const express = require('express');
const TestResult = require('../models/TestResult');
const router = express.Router();
const auth = require('../_helpers/Authenticate');





router.post('/', auth, async(req, res) => {

    const testResult = new TestResult({
        transaction: req.body.transaction,
        blood: req.body.blood,
        temp: req.body.temp
    });
    try {
        const saveData = await testResult.save();
        res.status(200).send(saveData);
    } catch (err) {
        res.status(400).send(err);
    }

});

module.exports = router;