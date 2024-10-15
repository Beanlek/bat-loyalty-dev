const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const {Parser} = require('json2csv');
const jwtAuth = require('../common/jwtAuth.js');
const Password = require('../common/password.js');
const generator = require('generate-password');
const db = require('../model/db.js');
const escapeHtml = require('escape-html');
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD';
const limit = 20; 
const{ S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const Tesseract = require('tesseract.js'); 
const sharp = require('sharp'); 
const multer = require('multer');
const fs = require('fs');
const path = require('path');  
const fetch = require('node-fetch'); 

let Ocr = {}; 

const region = conf.aws.aws_region; 
const bucketName = conf.aws.aws_bucketName; 
const accessKeyId = conf.aws.aws_access_key_id; 
const secretAccessKey = conf.aws.aws_secret_access_key; 

const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
}) 

Ocr.calculatePointsFromImage = async function (req, res){ 
    let user_id = req.user.id; 
    const receiptImageId = req.body.receiptImageId; 

    const receiptImages = await db.receipt_images.findOne({
        attributes: [ 'image_ocr' ], 
        where: { user_id: user_id, id: receiptImageId}, 
        raw: true 
    });

    if (!receiptImages) {
        return res.status(404).send({ errMsg: "No receipt images found" });
    } 

    const imageOcr = `receipts/${user_id}/${receiptImages.image_ocr}`; 

    const paramsOcr = {
        Bucket: bucketName, 
        Key: imageOcr
    } 

    try{ 

        collected_point = 0; 
        const seconds = 1800; 
        const commandOcr = new GetObjectCommand(paramsOcr);
        const urlOcr = await getSignedUrl(s3Client, commandOcr, { expiresIn: seconds}) 

        const response = await fetch(urlOcr);
        const arrayBuffer = await response.arrayBuffer();  // Convert blob to arrayBuffer
        const buffer = Buffer.from(arrayBuffer);  // Convert arrayBuffer to Node.js buffer

        const batProducts = await db.products.findAndCountAll({ 
            attributes :  [ 'name', 'points' ], 
            raw: true
        }); 
    
        //maybe can ignore if no bat products in the receipt... 
        
        // if(!batProducts.length){ 
        //     let transaction; 
        //     try{ 

        //         transaction = await sq.transaction(); 

        //         updateImageStatus = await db.receipt_images.update(
        //             { status: 'Failed' }, 
        //             { 
        //                 where: { id: receiptImageId, status: 'In Process' } 
        //             },
        //             {transaction}
        //         );

        //         await transaction.commit(); 

        //     }catch(e){ 

        //         if(transaction) await transaction.rollback(); 
        //         console.error("Error while updating the receipt image status to 'Failed' ", e); 
        //         throw e;

        //     }

        //     return res.status(400).send({ status: 'Failed', errMsg: 'No BAT products exist in the receipt'}); 

        // } 

        // let points = []; 
        // for (let bP of batProducts) { 
        //     points.push(bP.point); // Assuming 'point' is a valid column 
        // } 
    
        // // Check if points exist 
        // if (!points.length) { 
        //     return res.status(400).send({status: 'No points for the products found in the database'}); 
        // } 

        try{ 

            const ocrResult = await Tesseract.recognize(buffer, 'eng',{ 
                logger: m => console.log(m)
            }).then(({ data: { text } }) => {
                console.log(text); 
    
                // Loop each product to compare with extracted text
                // batProducts.rows.forEach(async function(prod) {
                //     if(searchWord(text, prod.name))
                //         collected_point=collected_point+prod.points 
                // }); 

                for (const prod of batProducts.rows) {
                    if (searchWord(text, prod.name)) {
                        collected_point += prod.points;
                    }
                }
    
                // Total point
                console.log(collected_point);
                }); 

                //for this function. Check before looping whether or not product exists in the db. 
    
                function searchWord(text, word) {
                    // Normalize both text and word to lowercase for case-insensitive search
                    const normalizedText = text.toLowerCase();
                    const normalizedWord = word.toLowerCase();
                
                    // Search for the word in the text
                    const position = normalizedText.indexOf(normalizedWord);
                
                    if (position !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                } 

        }catch(e){ 
            console.error("Error while calculating points for the image: ", e); 
            throw e;
        }

        let transaction; 

        try{ 
            
            transaction = await sq.transaction(); 
            updateImagePoints = await db.receipt_images.update(
                { 
                    image_points: collected_point, 
                    status: 'Success'
                }, 
                { 
                    where: { id: receiptImageId, status: 'In Process' } 
                },
                {transaction}
            ); 

            await transaction.commit(); 

        }catch(e){ 

            if(transaction) await transaction.rollback(); 
            console.error("Error updating the DB for new image points", e); 
            throw e;

        } 

        return res.status(200).send({status: 'Success', collected_point})
          
      }catch(e) { 
        return res.status(400).send({status: 'Error while fetching the image'})
        // console.error("Error while fetching the image:", e); 
        // throw e; 
      }

} 

module.exports = Ocr; 
