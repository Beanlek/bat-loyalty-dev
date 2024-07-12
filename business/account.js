const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const {Parser} = require('json2csv');
const jwtAuth = require('../common/jwtAuth');
const Password = require('../common/password');
const generator = require('generate-password');
const db = require('../model/db.js');
const escapeHtml = require('escape-html');
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD';
const limit = 20; 

let Account = {}; 

Account.list = async function(req,res){ 
    try{ 
        const accounts = await db.accounts.findAll({ 
            attributes: ['id', 'name', 'active', 'created_by', 'created_at', 'updated_by', 'updated_at']
            })  
        res.send(accounts); 
    }
    catch (err) {
        console.log(err); 
        res.status(500).send({ 
            errMsg: 'Internal Server Error'
        })
    } 
} 

module.exports = Account; 