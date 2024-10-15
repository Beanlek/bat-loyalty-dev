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

const Ocr = require('./ocr.js');

let Receipt = {}; 

Receipt.read = async function (req, res) { 
    const { user_id, outlet_id, created_by, image } = req.body; 
    const receiptUpload = Ocr.ocrUpload( user_id, outlet_id, created_by, image ); 

    let transaction; 
    try{ 
        await db.receipt_images.update({ 

        })
    }catch (e) { 
        if(transaction) await transaction.rollback(); 
        
    } 
    console.log('The file uploaded is', receiptUpload); 
}

Receipt.list = async function (req,res){
    
    try {
        const receipt = await db.receipt_images.findAll();

        res.status(200).send(receipt);

    } catch (error){
        console.error("Error fetching receipt:",error);
        res.status(500).json({error:"An error occurred while fetching account." });
    }
}

module.exports = Receipt;