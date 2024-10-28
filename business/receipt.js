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
const moment = require('moment');

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

Receipt.listMobile = async function (req, res) {
     const page = Number(req.query.page) || 1;
     const limit = Number(req.query.limit) || 10;
     const offset = (page - 1) * limit;

    try {
        const userId = req.query.user_id;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const receipts = await db.receipt_images.findAll({
            where: {
                user_id: userId
            },
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        // Count unopened receipts
        const unopenedCount = await db.receipt_images.count({
            where: {
                user_id: userId,
                has_opened: false
            }
        });

        // Group receipts by date        
        const groupedReceipts = receipts.reduce((acc, receipt) => {
            const date = moment(receipt.date).format('DD MMMM YYYY');
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({
                id: receipt.id,
                user_id: receipt.user_id,
                outlet_id: receipt.outlet_id,
                image: receipt.image,
                status: receipt.status,
                has_opened: receipt.has_opened,
                created_at: moment(receipt.created_at).format('YYYY-MM-DD HH:mm:ss')
            });
            return acc;
        }, {});

        // Move "Today" to the beginning if it exists
        const today = moment().format('DD MMMM YYYY');
        if (groupedReceipts[today]) {
            const { [today]: todayReceipts, ...rest } = groupedReceipts;
            res.status(200).json({ Today: todayReceipts, ...rest, unopened_count: unopenedCount});
        } else {
            res.status(200).json({...groupedReceipts, unopened_count: unopenedCount});    
        }
        
    } catch (error) {
        console.error("Error fetching receipts:", error);
        res.status(500).json({ error: "An error occurred while fetching receipts." });
    }
}


// mark the receipt as opened
Receipt.markAsOpened = async function (req, res) {
    const receiptId = req.body.receipt_id;
    
    if (!receiptId) {
        return res.status(400).json({ error: "Receipt ID is required" });
    }

    try {
        
        const receipt = await db.receipt_images.findOne({
            where: {
                id: receiptId
            }
        });
        
        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }
        
        if (receipt.has_opened) {
            return res.status(200).json({ message: "Receipt has already been opened." });
        }

        // Mark the receipt as opened
        receipt.has_opened = true;
        await receipt.save();

        res.status(200).json({ message: "Receipt marked as opened successfully." });

    } catch (error) {
        console.error("Error marking receipt as opened:", error);
        res.status(500).json({ error: "An error occurred while updating the receipt." });
    }
};





module.exports = Receipt;