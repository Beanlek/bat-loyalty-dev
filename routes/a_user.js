const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const jwtAuth = require('../common/jwtAuth');
const apiAuth = require('../common/apiAuth');
const db = require('../model/db.js');
const biz = require('../business/business.js')

router.get('/web/list', jwtAuth.checkToken, async (req, res)=>{
    biz.users.list(req,res);
});


router.get('/web/profile', jwtAuth.checkToken, async (req, res)=>{
    biz.users.profile(req,res);
});

router.put('/web/activate/:id', jwtAuth.checkToken, async (req, res)=>{
    biz.users.activate(req,res);
});

module.exports = router;