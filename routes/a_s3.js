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
const biz = require('../business/business.js');
const { uploadFile, deleteFile, getObjectSignedUrl } = require('../business/s3.js');
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD'; 
const jwt = require('jsonwebtoken'); 
const multer = require('multer'); 
const sharp = require('sharp'); 
const { app } = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const receipt_image = require('../model/receipt_image.js');
const limit = 20; 

let created_at = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
}).format(new Date());

let date = new Date();

let uploadTime = date.getFullYear() + 
    '-' + ('0' + (date.getMonth() + 1)).slice(-2) + 
    '-' + ('0' + date.getDate()).slice(-2) + 
    ' ' + ('0' + date.getHours()).slice(-2) + 
    ':' + ('0' + date.getMinutes()).slice(-2) + 
    ':' + ('0' + date.getSeconds()).slice(-2);

const storage = multer.memoryStorage(); 

const fileFilter = (req, file, cb) => { 
    if(file.mimetype && file.mimetype.split("/")[0]=== "image"){ 
        cb(null, true);
    }else { 
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false); 
    }
}; 

const upload = multer({ 
    storage, 
    fileFilter, 
    limits: { fileSize: 10000000, files: 1},
}); 

router.post('/uploadReceipt', apiAuth.checkToken, upload.single('file'), async (req, res) => {
    let {user_id} = req.token; 
    // let data = req.body.data;
    console.log(`api upload receipt run by ${user_id}`)
    
    const file = req.file;
    // let outlet_id = data.outlet_id;

    if (!file) return res.status(400).send({errMsg: "No file uploaded"});
    // if (!outlet_id) return res.status(400).send({errMsg: 'No outlet ID is assigned to the user'});

    try{ 
        const { outlet_id } = await db.user_accounts.findOne({ 
            attributes: ['outlet_id'], 
            where: {user_id: user_id}, 
            raw: true
        });

        if (!outlet_id) return res.status(422).send({errMsg: 'No outlet ID is assigned to the user'}); 

        const imageName = `receipts/${user_id}/R_${uploadTime}_${outlet_id}-${file.originalname}`; 

        const imageNameOcr = `receipts/${user_id}/R_${uploadTime}_${outlet_id}-OCR-${file.originalname}`;
        
        const uploadImageName = `R_${uploadTime}_${outlet_id}-${file.originalname}`; 

        const uploadImageNameOcr = `R_${uploadTime}_${outlet_id}-OCR-${file.originalname}`

        const thresholdValue = 150; 

        const fileBufferOriginal = await sharp(file.buffer)
        .toBuffer()

        const fileBufferOcr = await sharp(file.buffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
          for (let i = 0; i < data.length; i++) {
            data[i] = data[i] < thresholdValue ? 0 : 255;
          }
          return sharp(data, {
            raw: {
              width: info.width,
              height: info.height,
              channels: 1,
            },
          })
            .jpeg()
            .toBuffer();
        }) 

        try { 
            await uploadFile(fileBufferOriginal, fileBufferOcr, imageName, imageNameOcr, file.mimetype)
            // return res.status(200).send({status: "Successfully uploaded the image"}); 


            try{ 

                transaction = await sq.transaction();

                const imageDB = await db.receipt_images.create({ 
                    id: uuidv4(), 
                    user_id :user_id, 
                    date: new Date(), 
                    outlet_id: outlet_id, 
                    image: uploadImageName, 
                    image_ocr: uploadImageNameOcr, 
                    created_by: user_id, 
                    created_at: created_at, 
                    updated_by: user_id, 
                    updated_at: created_at, 
                    status: 'In Process',
                    image_points: 0
                },{
                    raw: true, logging: console.log, 
                    transaction
                }); 
    
                await transaction.commit(); 
    
                return res.status(201).send({ status: 'Success', message: 'Successfully inserted image into DB', receiptImageId: imageDB.id});
            }catch(e){ 
                if (transaction) await transaction.rollback();
                console.error(e)
                return res.status(500).send({status:'failed', errMsg: `Error to insert image into DB.`});
            }

        } catch (e) { 
            console.error("Error occurred:", e.message);
            console.error("Stack trace:", e.stack);  
            return res.status(500).send({ errMsg: "Failed to upload the image" });
        }

    }catch(e){ 
        console.error("Error occurred:", e.message);
        console.error("Stack trace:", e.stack);  
        return res.status(500).send({ errMsg: "No outlet ID is assigned to the user" });
    }
}); 

router.get('/getReceiptImageUrl', apiAuth.checkToken, async (req, res) => { 
    biz.s3.getObjectSignedUrl(req, res);
}); 

router.delete('/deleteFileAWS', apiAuth.checkToken, async (req, res) => { 
    biz.s3.deleteFile(req, res); 
})

module.exports = router; 
