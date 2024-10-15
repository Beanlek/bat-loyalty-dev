const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router(); 
const apiAuth = require('../common/apiAuth.js');
const db = require('../model/db.js');
const biz = require('../business/business.js')
const multer  = require('multer')
const path  = require('path');
const upload = multer({ dest: path.resolve(__dirname,'../public/uploads/') }); 

router.post('/calculatePoints', apiAuth.checkToken, async (req, res)=>{
    biz.ocr.calculatePointsFromImage(req,res);
});

module.exports = router;