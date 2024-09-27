const business = {};

business.users = require('./user.js');   
business.products = require('./product.js');   
business.accounts = require('./account.js');        
business.outlets = require('./outlet.js');      
business.ocr = require('./ocr.js'); 
business.loyalty_product = require('./loyalty_product.js');   
business.s3 = require('./s3.js'); 


module.exports = business;