const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const moment = require('moment');
const {Parser} = require('json2csv');
const jwtAuth = require('../common/jwtAuth.js');
const apiAuth = require('../common/apiAuth.js');
const db = require('../model/db.js');
const biz = require('../business/business.js')
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD';
const limit = 20; 

router.get('/web/list', jwtAuth.checkToken, async(req, res) => { 
    biz.account.list(req, res); 
});  

router.post('/web/create', jwtAuth.checkToken, async(req, res) => { 
    biz.account.create(req, res); 
});

router.put('/web/activate/:id', jwtAuth.checkToken, async(req, res) => { 
    biz.account.activate(req, res); 
});

module.exports = router; 