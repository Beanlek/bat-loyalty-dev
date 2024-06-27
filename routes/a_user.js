const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const jwtAuth = require('../common/jwtAuth');
const db = require('../model/db.js');
const biz = require('../business/business.js')

router.get('/list', jwtAuth.checkToken, async (req, res)=>{
    biz.users.list(req,res);
});

module.exports = router;