const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const jwtAuth = require('../common/jwtAuth.js');
const db = require('../model/db.js');
const biz = require('../business/business.js')
const multer  = require('multer')
const path  = require('path');
const upload = multer({ dest: path.resolve(__dirname,'../public/uploads/') });

router.post('/ocrPost', jwtAuth.checkToken,  upload.single('file'), async (req, res)=>{
    biz.ocr.ocrUpload(req,res);
});

module.exports = router;