const express = require('express');
const router = express.Router();
const jwttoken = require('jsonwebtoken');
const Role = require('../_helpers/role');
const PartnerStatus = require('../_helpers/AdminPartnerStatus');
const Admin = require('../models/AdminPartner');
const Medic = require('../models/Medic');
const DetailUser = require('../models/DetailUser');
const SuperAdmin = require('../models/SuperAdmin');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const auth = require('../_helpers/Authenticate');
require('dotenv/config');


router.post('/', async(req, res) => {
    const { email, password } = req.body

    const userSearch = await User.findOne({ email }).lean()
    if (!userSearch) {
        return res.status(400).json({
            message: "Invalid Credential"
        });
    } else {
        bcrypt.compare(password, userSearch.password).then(isMatch => {
            if (isMatch) {
                const user = {
                    id: userSearch._id,
                    role: userSearch.role
                };
                if (user.role == Role.Partner) {

                    const admin = Admin.findOne({ user_id: user.id }).then(result => {
                        if (result.status == PartnerStatus.Deleted) {
                            return res.status(400).json({ message: "Account is Blocked" });
                        } else if (result.status == PartnerStatus.Not_Verified) {
                            return res.status(400).json({ message: "Account is Not Verified" });
                        }
                        var token = jwttoken.sign(
                            user,
                            process.env.JWT_SECRET);

                        return res.json({ "token": token, "data": user });
                    });
                } else if (user.role == Role.Medic) {
                          const medic = Medic.findOne({ user_id: user.id }).then(result => {
                        if (result.status == PartnerStatus.Deleted) {
                            return res.status(400).json({ message: "Account is Blocked" });
                        } 
                        var token = jwttoken.sign(
                            user,
                            process.env.JWT_SECRET);

                        return res.json({ "token": token, "data": user });
                    });
                  
                } else if (user.role == Role.Admin) {

                   
                    const superAdmin = SuperAdmin.findOne({ user_id: user.id }).then(result => {
                        if (!result.is_active) {
                            return res.status(400).json({ message: "Account is Blocked" });
                        } 
                        var token = jwttoken.sign(
                            user,
                            process.env.JWT_SECRET);

                        return res.json({ "token": token, "data": user });
                    });
                } else {
                     const detailUser = DetailUser.findOne({ user_id: user.id }).then(result => {
                        if (result.is_deleted) {
                            return res.status(400).json({ message: "Account is Blocked" });
                        } 
                        var token = jwttoken.sign(
                            user,
                            process.env.JWT_SECRET);

                        return res.json({ "token": token, "data": user });
                    });
                }

               
            } else {
                return res.status(400).json({
                    message: "Password or email is incorrect"
                });
            }
        });
    }
})

router.post('/logout', auth, (req, res) => {
    req.headers['authorization'] = null
    res.json({ 'message': 'Logged Out' })
})





module.exports = router;