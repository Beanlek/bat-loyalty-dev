'use strict'

const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const Sequelize = require('sequelize');

const sequelize = new Sequelize(conf.db.name, conf.db.user, conf.db.pass, {
  dialect: 'postgres',
  host: conf.db.host,
  port: conf.db.port,
  timezone: conf.db.timezone,
  dialectOptions: {
    useUTC: true
  },
  pool: {
    max: 300,
    min: 10,
    idle: 600000
  },
  logging: false,
  alter: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.accounts = require('./accounts.js')(sequelize, Sequelize);
db.loyalty_products = require('./loyalty_products.js')(sequelize,Sequelize);
db.outlets = require('./outlets.js')(sequelize,Sequelize);
db.products = require('./products.js')(sequelize, Sequelize);
db.user_accounts = require('./user_account.js')(sequelize,Sequelize);
db.users = require('./users.js')(sequelize, Sequelize);
db.receipt_images = require('./receipt_image.js')(sequelize, Sequelize);

sequelize.sync();

module.exports = db;