const express = require('express');
const app = express();

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const cors = require('cors');
require('dotenv/config');

app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors())

app.use('/api/',express.static('Images'));


const userroute = require('./routes/user');
const categoryroute = require('./routes/category');
const partnerroute = require('./routes/partner');
const vaccineroute = require('./routes/vaccine');
const authentication = require('./routes/authorize');
const adminPartnerRoute = require('./routes/adminPartner');
const detailUser = require('./routes/detailUser');
const scheduleRoute = require('./routes/schedule');
const dashboardRoute = require('./routes/dashboard');
const medicRoute = require('./routes/medic');
const transactionRoute = require('./routes/transaction');
const questionRoute = require('./routes/question');
const superAdminRoute = require('./routes/superAdmin');
const testRoute = require('./routes/testResult');
const chatRoom = require('./routes/chatRoom');
const complainRoute = require('./routes/complain');



app.use('/api/authentication', authentication);
app.use('/api/users', userroute);
app.use('/api/categories', categoryroute);
app.use('/api/partners', partnerroute);
app.use('/api/vaccines', vaccineroute);
app.use('/api/adminPartner', adminPartnerRoute);
app.use('/api/detailUser', detailUser);
app.use('/api/schedules', scheduleRoute);
app.use('/api/medics', medicRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/transaction', transactionRoute);
app.use('/api/question', questionRoute);
app.use('/api/superAdmin', superAdminRoute);
app.use('/api/testResult', testRoute);
app.use('/api/complain', complainRoute);
app.use('/api/chatRoom', chatRoom);


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/', (request, response) => {
    response.send('it works!');
});
//Connect to DB
mongoose.connect(process.env.DB_CONNECTION, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
    console.log("MongoDB database connection established successfully");
});


app.listen(4000);
