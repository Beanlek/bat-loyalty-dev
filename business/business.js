const business = {};

business.account = require('./account.js');
business.loyalty_product = require('./loyalty_product.js');
business.ocr = require('./ocr.js'); 
business.outlets = require('./outlet.js');
business.products = require('./product.js');
business.receipt = require('./receipt.js');
business.s3 = require('./s3.js'); 
business.user_account = require('./user_account.js');
business.users = require('./user.js');

module.exports = business;