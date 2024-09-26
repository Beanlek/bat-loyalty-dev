const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const moment = require('moment');
const {Parser} = require('json2csv');
const jwtAuth = require('../common/jwtAuth');
const apiAuth = require('../common/apiAuth');
const db = require('../model/db.js');
const biz = require('../business/business.js')
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD';
const limit = 20;

router.post('/app/register', async (req,res) => {
    biz.users.register(req,res);
});

router.get('/app/self', apiAuth.checkToken, async (req,res) => {
    req.params.mobile = req.token.mobile;
    biz.users.read(req,res);
}); 

router.get('/app/user_list', async (req, res) =>{ 
    biz.users.user_list(req, res); 
});

router.get('/app/registerValidate', async (req, res) => { 
    biz.users.isExistPhoneUsername(req, res); 
}); 

router.get('/app/getOutletRegister', async (req, res) => { 
    biz.users.getOutletRegister(req, res); 
})

router.all('/*', (req, res) => {
    res.status(404).send('API not found');  
})

module.exports = router;