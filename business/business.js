const business = {};

business.users = require('./user.js');   
business.products = require('./product.js');   
business.accounts = require('./account.js');        
business.outlets = require('./outlet.js');      
business.ocr = require('./ocr.js'); 

module.exports = business;