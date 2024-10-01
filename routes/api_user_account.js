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

router.post('/app/updateActive', apiAuth.checkToken, async (req,res) => {
    biz.user_account.updateActive(req,res);
}); 

router.post('/app/insert', apiAuth.checkToken, async (req,res) => {
    req.params.user_id = req.token.user_id;
    biz.user_account.insert(req,res);
}); 

router.all('/*', (req, res) => {
    res.status(404).send('API not found');  
})

module.exports = router; 