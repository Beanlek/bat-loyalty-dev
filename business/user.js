const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
const express = require('express');
const router = express.Router();
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

let User = {};

User.register = async function(req,res){
    // ... (unchanged)
}

User.read = async function(req, res){
    // ... (unchanged)
}

User.list = async function(req,res){
  let user_id = req.token.user_id;
  let user_type = req.token.user_type;
  
  let {keyword, lastlogin} = req.query;

  let type = req.query.type || 'all';
  let active = req.query.active || 'all';
  let searchby = req.query.searchby || 'userId';

  let page = req.query.page;
  let sortColumn = req.query.sort_column;
  let sortBy = req.query.sort_by;
  let limitRows = req.query.limit_rows;

  let order = [['id']];
  let where = {};

  page = (!page || isNaN(page) || parseInt(page) < 0)? 0 : parseInt(page) - 1;
  limitRows = (isNaN(limitRows) || !limitRows) ? limit : limitRows

  let offset = page * limitRows;

  if(searchby == 'userId' && keyword) where.id = {[Op.iLike]: `%${keyword}%`}
  if(searchby == 'fullName' && keyword) where.name = {[Op.iLike]: `%${keyword}%`};
  if(type.toLowerCase() == 'cashier') where.user_type = {[Op.eq]: 'cashier'};
  if(type.toLowerCase() == 'admin') where.user_type = {[Op.eq]: 'admin'};
  if(active.toLowerCase() == 'active') where.active = {[Op.eq]: true};
  if(active.toLowerCase() == 'inactive') where.active = {[Op.eq]: false};
  
  if(lastlogin){
    let ll = lastlogin.split(',');

    if(ll.length == 1){
      if(!dayjs(ll[0], df).isValid()) return res.status(422).send({errMsg: 'Date format is invalid.'});
      where.last_login_at = {[Op.gte]: ll[0]};
    } else{
      if(!dayjs(ll[0], df).isValid() || !dayjs(ll[1], df).isValid()) return res.status(422).send({errMsg: 'Date format is invalid.'});
      where.last_login_at = { [Op.between]: [ 
        dayjs(ll[0]).startOf('day').toDate(), 
        dayjs(ll[1]).endOf('day').toDate() 
      ]}
    }
  }

  if (sortColumn != null && sortColumn.trim() != '' && sortBy != null && sortBy.trim() != '') {
    order = [[sortColumn, sortBy]];
  }

  let user_listing;
  
  try{
    user_listing = await db.users.findAndCountAll({
      order: order,
      where: where,
      offset: offset,
      limit: limitRows, 
      raw: true,
      attributes: {
        include: [
          [
            sq.literal(`(SELECT COUNT(*) FROM outlets WHERE outlets.created_by = users.id)`),
            'outlet_count'
          ]
        ]
      },
      logging: console.log
    });

    user_listing.rows = user_listing.rows.map(user => ({
      ...user,
      has_outlets: user.outlet_count > 0
    }));

    user_listing.limit = limitRows;
    user_listing.offset = offset;

  }catch(e){
    console.error(e);
    return res.status(500).send({errMsg: 'Failed to get users.'});
  }
  return res.send({status: 'success', user_listing});
}

module.exports = User;