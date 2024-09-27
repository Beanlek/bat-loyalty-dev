// const env = process.env.NODE_ENV || 'dev';
// const conf = require('../config/config.json')[env];
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const dayjs = require('dayjs');
// const {Parser} = require('json2csv');
// const jwtAuth = require('../common/jwtAuth.js');
// const Password = require('../common/password.js');
// const generator = require('generate-password');
// const db = require('../model/db.js');
// const escapeHtml = require('escape-html');
// const Op = db.Sequelize.Op;
// const sq = db.sequelize;
// const df = 'YYYY-MM-DD';
// const limit = 20;
// const Tesseract = require('tesseract.js'); 
// const sharp = require('sharp'); 
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path'); 

// let Ocr = {}; 

// Ocr.calculatePoints = async function (req, res){ 
//   let name = name; 
//   let points = points; 
// } 

// Ocr.extractTexts = async function (req, res){ 



// }

// // Define the threshold value (0-255)
// const thresholdValue = 150;

// // Can change it by reading the data from database 

// // loyalty_products = db.products.findAll({ 
// //   where: {name: name, points: points}
// // }) 

// BAT_products = [
//     { name: 'Dunhill', point: 10 },
//     { name: 'Lucky Strike', point: 20 },
//     { name: 'Pall Mall', point: 30 },
//     { name: 'Rothmans', point: 40 },
//     { name: 'Gardenia', point: 50 }, 
//     { name: 'Dutch Lady', point: 100 }
// ];

// // Initial point
// collected_point = 0

// // Convert image to grayscale, then apply thresholding
// sharp('images/OcrTest6.jpeg')
//   .grayscale()
//   .raw()
//   .toBuffer({ resolveWithObject: true })
//   .then(({ data, info }) => {
//     for (let i = 0; i < data.length; i++) {
//       data[i] = data[i] < thresholdValue ? 0 : 255;
//     }
//     return sharp(data, {
//       raw: {
//         width: info.width,
//         height: info.height,
//         channels: 1,
//       },
//     })
//       .toFile(`images/OcrTest6-thresholded.jpeg`);
//   })
//   .then(() => {
//     console.log('Thresholding complete. Output saved as output_thresholded.jpg');
//   })
//   .catch(err => {
//     console.error('Error processing image:', err);
//   });

// // Extract text from processed image
// Tesseract.recognize(
// 'images/OcrTest6-thresholded.jpeg',
// 'eng',
// {
//     logger: m => console.log(m)
// }
// ).then(({ data: { text } }) => {
// console.log(text);

// // Loop each product to compare with extracted text
// BAT_products.forEach(function(prod) {
//     if(searchWord(text, prod.name))
//         collected_point=collected_point+prod.point
// });

// // Total point
// console.log(collected_point);
// });

// // Find product from extracted text
// function searchWord(text, word) {
//     // Normalize both text and word to lowercase for case-insensitive search
//     const normalizedText = text.toLowerCase();
//     const normalizedWord = word.toLowerCase();

//     // Search for the word in the text
//     const position = normalizedText.indexOf(normalizedWord);

//     if (position !== -1) {
//         return true;
//     } else {
//         return false;
//     }
// } 

// module.exports = Ocr; 
