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

db.users = require('./users.js')(sequelize, Sequelize); 
db.products = require('./products.js')(sequelize, Sequelize); 
db.outlets = require('./outlets.js')(sequelize, Sequelize); 
db.accounts = require('./accounts.js')(sequelize, Sequelize); 

sequelize.sync();

module.exports = db;