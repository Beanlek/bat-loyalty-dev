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

// router.post('/disable/:productId', jwtAuth.checkTokenForApi, async (req, res)=>{ 
//     biz.products.inactive(req, res)
// }); 

// router.post('/web/insert', jwtAuth.checkTokenForApi, async (req, res)=>{ 
//     biz.products.insert(req, res)
// })

// router.get('/get/:productId', jwtAuth.checkTokenForApi, async (req, res)=>{ 

//     biz.products.getById(req, res)
// }); 

// router.get('/update/:productId', jwtAuth.checkTokenForApi, async (req, res)=>{ 
    
//     biz.products.update(req, res)
// }); 

//change to jwtAuth.checkTokenForApi for portal later 
router.post('/web/insert', apiAuth.checkToken, async(req, res) => { 
    biz.products.insert(req, res);
}); 

//change to jwtAuth.checkTokenForApi for portal later 
router.put('/web/update/:id', apiAuth.checkToken, async(req, res) => { 
    biz.products.update(req, res); 
}); 

//change to jwtAuth.checkTokenForApi for portal later
router.put('/web/activate/:id', apiAuth.checkToken, async(req, res) => { 
    biz.products.activate(req, res); 
})

module.exports = router; 