const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env]; 
const express = require('express');
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
const router = express.Router(); 
const{ S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer'); 

let S3 = {}; 

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

S3.uploadFile = async function (fileBufferOriginal, fileBufferOcr, imageName, imageNameOcr, mimetype){

    const uploadParamsOriginal = {
      Bucket: bucketName,
      Body: fileBufferOriginal,
      Key: imageName,
      ContentType: mimetype
    } 

    const uploadParamsOcr = {
      Bucket: bucketName,
      Body: fileBufferOcr,
      Key: imageNameOcr,
      ContentType: mimetype
    } 
  
    try{ 
      await Promise.all([ 
        s3Client.send(new PutObjectCommand(uploadParamsOriginal)),
        s3Client.send(new PutObjectCommand(uploadParamsOcr))
      ]); 

      return { status: "Both files uploaded successfully" }; 
    }catch(e){ 
      console.error("Error uploading files:", e);
      // throw e;
      return res.status(500).send({status:'failed', errMsg: `Error uploading files ${e}.`});
    } 
} 

S3.deleteFile = async function (req, res){ 
  let user_id = req.user.id; 
  let transaction; 

  // const imageOriginal = req.body.imageOriginal; 
  // const imageOcr = req.body.imageOcr; 
  const receiptImageId = req.body.receiptImageId; 

  // if (!imageOriginal || !imageOcr) {
  //   return res.status(400).send({ status: 'Both imageOriginal and imageOcr must be provided.' });
  // } 

  if(!receiptImageId) {return res.status(400).send({errMsg: 'Receipt image ID is required'})}

  try { 

    const receiptImagesRetrieve = await db.receipt_images.findOne({
      attributes: ['image', 'image_ocr'], 
      where: { user_id: user_id, id: receiptImageId }, 
      order: [['created_at', 'DESC']],
      raw: true 
    }); 

    transaction = await sq.transaction();

    const receiptImages = await db.receipt_images.destroy({
      where: { user_id: user_id, id: receiptImageId }
    }, { transaction });

    await transaction.commit();

    const imageOriginalAWS = `receipts/${user_id}/${receiptImagesRetrieve.image}`;
    const imageOcrAWS = `receipts/${user_id}/${receiptImagesRetrieve.image_ocr}`;

    const deleteParamsOriginal = {
      Bucket: bucketName,
      Key: imageOriginalAWS,
    };

    const deleteParamsOcr = {
      Bucket: bucketName,
      Key: imageOcrAWS,
    };

    try {
      await Promise.all([
        s3Client.send(new DeleteObjectCommand(deleteParamsOriginal)),
        s3Client.send(new DeleteObjectCommand(deleteParamsOcr))
      ]);

      return res.status(200).send({ status: 'Image deleted successfully from DB and AWS' });

    } catch (awsError) {
      console.error("Error deleting the image from AWS:", awsError);

      return res.status(500).send({ errMsg: 'Image deleted from DB, but failed to delete from AWS' });
    }

  } catch (dbError) {
    if (transaction) await transaction.rollback();
    console.error("Error deleting image from DB:", dbError);
    return res.status(500).send({ errMsg: 'Error deleting image from DB' });
  }

} 

S3.getObjectSignedUrl = async function (req, res){
    let user_id = req.user.id; 
    const receiptImageId = req.body.receiptImageId;

    if (!receiptImageId) { return res.status(404).send({ errMsg: "No receipt image ID" }); }

    const receiptImages = await db.receipt_images.findOne({
      attributes: ['image', 'image_ocr'], 
      where: { user_id: user_id, id: receiptImageId}, 
      order: [['created_at', 'DESC']],
      raw: true 
    });

    if (!receiptImages) { return res.status(404).send({ errMsg: `No receipt images found for user ${user_id}` }); }

    const imageOriginal = `receipts/${user_id}/${receiptImages.image}`;
    const imageOcr = `receipts/${user_id}/${receiptImages.image_ocr}`;

    const paramsOriginal = {
      Bucket: bucketName,
      Key: imageOriginal
    } 

    const paramsOcr = {
      Bucket: bucketName,
      Key: imageOcr
    } 
  
    try{ 
      
      // https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
      const commandOriginal = new GetObjectCommand(paramsOriginal);
      const seconds = 1800; 
      const urlOriginal = await getSignedUrl(s3Client, commandOriginal, { expiresIn: seconds }); 
      const commandOcr = new GetObjectCommand(paramsOcr);
      const urlOcr = await getSignedUrl(s3Client, commandOcr, { expiresIn: seconds}) 

        // let status = 'successfully get the signed url for the images.';

        res.status(200).send({
          status: 'successfully get the signed url for the images.',
          data: {
            url_original: urlOriginal,
            url_ocr: urlOcr,
          }
        });

        // return res.status(200).send({status, urlOriginal, urlOcr})
        
    }catch(e) { 
      console.error("Error getting image url:", e); 
      // throw e;
        // throw new Error("Failed to upload receipt"); 

      return res.status(500).send({status:'failed', errMsg: `Error getting image url ${e}.`});
    }
    
} 

module.exports = S3; 
