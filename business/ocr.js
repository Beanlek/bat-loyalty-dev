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
const Tesseract = require('tesseract.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

let Ocr = {};

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Adjust this to your desired upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

Ocr.ocrUpload = async function (req, res) {
  let { user_id, role, allowed_sites } = req.token;

  if (!req.file) {
      return res.status(422).send({ errMsg: 'Please upload an image file' });
  }

  // Validate file type (ensure it's an image)
  if (!req.file.mimetype.startsWith('image/')) {
      return res.status(422).send({ errMsg: 'Invalid file type, please upload images only' });
  }

  try {
      // Process the image with OCR
      const imagePath = req.file.path;
      const text = await extractTextFromImage(imagePath);

      words = text.split(/\s+/);

      // Trim each word and filter to get words with exactly 8 characters
      selectedWords = words.map(word => word.trim()).filter(word => word.length === 12);
      selectedWordsString = selectedWords.join(', ');

      // const result = getWords(text);

      // console.log(result)

      return res.send({ status: 'success', ocrText: text });
  } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).send({ errMsg: 'Failed to process the image' });
  }
};

async function extractTextFromImage(imagePath) {
  try {
      const { data: { text } } = await Tesseract.recognize(imagePath);
      return text;
  } catch (error) {
      console.error('Error extracting text from image:', error);
      return '';
  }
}

async function getWords(text) {
  // Split the text into an array of words
  let words = text.split(/\s+/);

  // Trim each word and filter to get words with exactly 8 characters
  let selectedWords = words.map(word => word.trim()).filter(word => word.length === 12);

  return selectedWords;
}

module.exports = Ocr;