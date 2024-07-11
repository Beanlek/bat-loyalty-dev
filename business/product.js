const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const {Parser} = require('json2csv');
const apiAuth = require('../common/apiAuth.js')
//const jwtAuth = require('../../../common/jwtAuth.js');
const Password = require('../common/password.js');
const generator = require('generate-password');
const db = require('../model/db.js');
const escapeHtml = require('escape-html');
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD';
const limit = 20; 

let Product = {}; 
let products; 

// Product.insert = async function(req,res){ 
    
// } 

// Product.get = async function(req,res){ 
//     try {
//         const products = await Product.findAll();
//         res.json(products);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// } 

// Product.update = async function(req,res){ 
// } 

// Product.delete = async function(req,res){ 
// } 

Product.list = async function(req,res){ 
    let products; 
    try{ 
        const products = await db.products.findAll({ 
            attributes: ['id', 'name', 'brand', 'image', 'points'], 
            })  
        res.send(products); 
    }catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
} 

module.exports = Product; 