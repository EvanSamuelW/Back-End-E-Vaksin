const express = require('express');
const Category = require('../models/Category');
const auth = require('../_helpers/Authenticate');


const router = express.Router();


router.get('/', async(req, res) => {
    try {
        const category = await Category.find().populate({
            path: 'creator'
        }).sort({ is_deleted: 1 }).
        lean();


        for (let i = 0; i < category.length; i++) {
            category[i].creator.full_name = category[i].creator.first_name + " " + category[i].creator.last_name;
        }

        res.status(200).send(category);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/active', async(req, res) => {
    try {
        const category = await Category.find({ is_deleted: false });
        res.json(category);
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/', auth,async(req, res) => {
    const category = new Category({

        name: req.body.name,
        description: req.body.description,
        creator: req.user.id
    });
    try {
        const savedCategory = await category.save();
        res.json(savedCategory)
    } catch (err) {
        res.json({ message: err })
    }

});

router.patch('/enable/:postId', auth, async(req, res) => {

    try {
        const category = await Category.updateOne({ _id: req.params.postId }, { $set: { is_deleted: false } });
        res.json(category);
    } catch (err) {
        res.json({ message: err })
    }
});

router.get('/:postId', async(req, res) => {

    try {
        const category = await Category.findById(req.params.postId);
        res.json(category);
    } catch (err) {
        res.json({ message: err })
    }
});

router.delete('/:postId', auth, async(req, res) => {

    try {
        const category = await Category.updateOne({ _id: req.params.postId }, { $set: { is_deleted: true } });
        res.json(category);
    } catch (err) {
        res.json({ message: err })
    }
});

router.put('/:postId', auth, async(req, res) => {

    try {
        const category = await Category.updateOne({ _id: req.params.postId }, { $set: { name: req.body.name, description: req.body.description } });
        res.json(category);
    } catch (err) {
        res.json({ message: err })
    }
});


module.exports = router;