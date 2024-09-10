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

//change to jwtAuth.checkTokenForApi for portal later 
// router.post('/web/insert', jwtAuth.checkToken, async(req, res) => { 
router.post('/web/insert', async(req, res) => { 
    biz.loyalty_product.insert(req, res);
}); 

router.get('/web/list', async (req, res)=>{
    biz.loyalty_product.list(req,res);
});

module.exports = router; 