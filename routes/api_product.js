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

router.get('/app/list', apiAuth.checkToken, async (req,res) => {
    req.params.mobile = req.token.mobile;
    biz.products.list(req,res);
}); 

router.get('/app/get/:id', apiAuth.checkToken, async (req, res) => { 
    biz.products.getById(req,res);
}); 

router.all('/*', (req, res) => {
    res.status(404).send('API not found');  
})

module.exports = router; 