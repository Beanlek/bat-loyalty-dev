const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const jwtAuth = require('../common/jwtAuth');
const apiAuth = require('../common/apiAuth');
const db = require('../model/db.js');
const biz = require('../business/business.js')

router.get('/app/list', apiAuth.checkToken, async (req, res)=>{
    biz.receipt.listMobile(req,res);
});

router.post('/app/markAsOpened', apiAuth.checkToken, async (req, res)=>{
    req.params.user_id = req.token.user_id;
    biz.receipt.markAsOpened(req,res);
});



module.exports = router;