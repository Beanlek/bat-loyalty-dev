const business = {};

business.users = require('./user.js');
business.outlets = require('./outlet.js');
business.user_account = require('./user_account.js');
business.account = require('./account.js');

module.exports = business;