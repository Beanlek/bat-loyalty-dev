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
const { type } = require('jquery');
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD';
const limit = 20;

let User = {}; 

User.getOutletRegister = async function(req, res){ 
    let companyId = req.body.id; 
    let postcode = req.body.postcode; 

    if (!companyId) return res.status(422).send({errMsg: 'Missing payload: companyId'}); 
    if (!postcode) return res.status(422).send({errMsg: 'Missing payload: postcode'}); 

    let outletList; 

    try { 
        outletList = await db.outlets.findAll({ 
            attributes: [ 'id', 'name', 'address1', 'address2', 'address3', 'postcode', 'city', 'state' ],
            where : { account_id : companyId, postcode: postcode }
        }) 

        if(!outletList) return res.status(422).send({errMsg: 'No Outlets for the ID ${companyId} and Postcode ${postcode} is found'}); 

        res.send({
          status: 'success',
          data: {
            count: outletList.length,
            rows: outletList
          }
        }); 
    }catch (e) { 
        console.error(e); 
        return res.status(500).send({errMsg: 'Internal Server Error'}); 
    }
}

User.isExistPhoneUsername = async function(req, res){ 
    let name = req.body.name; 
    let mobile =  req.body.mobile; 

    if (!name || !mobile) return res.status(422).send({errMsg: 'Missing payload'}); 

    try {    

        name = await db.users.findOne({
            attributes: {exclude: ['password']},
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('id')), sq.fn('lower', name))
        });
    
        if(name) return res.status(422).send({status:'failed', errMsg:'Username is already taken. Please try another username.'})
        
        mobile = await db.users.findOne({
            attributes: {exclude: ['password']},
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('mobile')), sq.fn('lower', mobile))
        });
    
        if(mobile) return res.status(422).send({status:'failed', errMsg:'Phone number is already registered.'})

    }catch (e) { 
        console.error(e) 
        return res.status(500).send({errMsg: 'Internal Server Error'}); 
    } 

    return res.status(200).send({message: 'Username and Phone Number is available'})
}

User.isExistUsername = async function(req, res){ 
    let user_id = req.body.user_id;

    if (!user_id) return res.status(422).send({errMsg: 'Missing payload'}); 

    try {    

        let name = await db.users.findOne({
            attributes: {exclude: ['password']},
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('id')), sq.fn('lower', user_id))
        });
    
        if(!name) return res.status(422).send({status:'failed', errMsg:'Username does not exist.'})

    }catch (e) { 
        console.error(e) 
        return res.status(500).send({errMsg: 'Internal Server Error'}); 
    } 

    return res.status(200).send({message: 'Username exist'})
}

User.register = async function(req,res){
    let created_at = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date());

    let data = req.body.data;
    console.log(data);
    // let data = JSON.parse(_data.data);
  
    let id = data.id; //username
    let name = data.name;
    let password = data.password;

    let address1 = data.address1;
    let address2 = data.address2;
    let address3 = data.address3;
    let postcode = data.postcode;
    let city = data.city;
    let state = data.state;

    let email = data.email;
    let mobile = data.mobile;

    let outlet_id = data.outlet_id;

    let security_image = data.security_image;
    let security_phrase = data.security_phrase;
    
    if(!id) return res.status(422).send({errMsg: 'Please enter User Id / Username.'});
    if(!name) return res.status(422).send({errMsg: 'Please enter Name.'});
    if(!password) return res.status(422).send({errMsg: 'Please enter Password.'});

    if(!address1) return res.status(422).send({errMsg: 'Please enter Address1.'});
    if(!address2) return res.status(422).send({errMsg: 'Please enter Address2.'});
    if(!address3) return res.status(422).send({errMsg: 'Please enter Address3.'});
    if(!postcode) return res.status(422).send({errMsg: 'Please enter Postcode.'});
    if(!city) return res.status(422).send({errMsg: 'Please enter City.'});
    if(!state) return res.status(422).send({errMsg: 'Please enter State.'});

    if(!email || !email.includes('@')) return res.status(422).send({errMsg: 'Please enter a correct Email format.'});
    if(!mobile) return res.status(422).send({errMsg: 'Please enter Phone Number.'});

    if(!outlet_id) return res.status(422).send({errMsg: 'Please enter Outlet ID.'});

    if(!security_image) return res.status(422).send({errMsg: 'Please choose security image.'});
    if(!security_phrase) return res.status(422).send({errMsg: 'Please choose security phrase.'});
    
    if(Password.score(password) < 4) {
      return res.status(422).send({errMsg: 'Password complexity requirement not met.'});
    }
  
    let transaction;
    let user;
    let phone;
    let outlet;

    try {
     
        user = await db.users.findOne({
            attributes: {exclude: ['password']},
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('id')), sq.fn('lower', id))
        });
    
        if(user) return res.status(422).send({status:'failed', errMsg:'Username is already taken. Please try another username.'})
        
        phone = await db.users.findOne({
            attributes: {exclude: ['password']},
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('mobile')), sq.fn('lower', mobile))
        });
    
        if(phone) return res.status(422).send({status:'failed', errMsg:'Phone number is already registered.'})
    
          outlet = await db.outlets.findOne({
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('id')), sq.fn('lower', outlet_id))
        });
    
        if(outlet === null) return res.status(422).send({status:'failed', errMsg:'Outlet does not exist.'})
    
        transaction = await sq.transaction();
    
        let hash = bcrypt.hashSync(password, conf.saltRounds);

        console.log({id})
        await db.user_accounts.create({
            user_id: id,
            outlet_id: outlet_id,

            created_by: id,
            created_at: created_at,
            updated_by: id,
            updated_at: created_at
        })
        
        await db.users.create({
            id: id,
            name: name,
            password: hash,
            active: true,

            address1: address1,
            address2: address2,
            address3: address3,
            postcode: postcode,
            city: city,
            state: state,
            
            email: email,
            mobile: mobile,
            user_type: 'cashier',

            points: '0',

            security_image: security_image,
            security_phrase: security_phrase,

            created_by: id,
            created_at: created_at,
            updated_by: id,
            updated_at: created_at
        },{transaction});

        await transaction.commit();
  
    } catch(e) {
      if(transaction) transaction.rollback();
      console.error(e);
      return res.status(500).send({status:'failed', errMsg: 'Failed to register.'});
    }
  
    return res.send({status:'success', msg:`User ${id} successfully registered.`});
}

User.updateSelf = async function (req,res) {
  let created_at = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
  }).format(new Date());

  let data = req.body.data; console.log(data);

  // check for 'where' case in sql
  let id = req.params.user_id; // username
  let mobile = req.params.mobile;

  // can change or update
  let name = data.name;
  let address1 = data.address1;
  let address2 = data.address2;
  let address3 = data.address3;
  let postcode = data.postcode;
  let city = data.city;
  let state = data.state;
  let email = data.email;

  if(!id) return res.status(422).send({errMsg: 'Please enter User Id / Username.'});
  if(!mobile) return res.status(422).send({errMsg: 'Please enter Phone Number.'});

  if(!name) return res.status(422).send({errMsg: 'Please enter Name.'});
  if(!address1) return res.status(422).send({errMsg: 'Please enter Address1.'});
  if(!address2) return res.status(422).send({errMsg: 'Please enter Address2.'});
  if(!address3) return res.status(422).send({errMsg: 'Please enter Address3.'});
  if(!postcode) return res.status(422).send({errMsg: 'Please enter Postcode.'});
  if(!city) return res.status(422).send({errMsg: 'Please enter City.'});
  if(!state) return res.status(422).send({errMsg: 'Please enter State.'});
  if(!email || !email.includes('@')) return res.status(422).send({errMsg: 'Please enter a correct Email format.'});

  let transaction;
  transaction = await sq.transaction();

  try {
    await db.users.update({
        name: name,
        address1: address1,
        address2: address2,
        address3: address3,
        postcode: postcode,
        city: city,
        state: state,
        email: email,
        updated_by: id,
        updated_at: created_at
    },{
      where: {
        id: { [Op.eq]: id},
        mobile: { [Op.eq]: mobile},
      },
      raw: true, logging: console.log, 
      transaction
    });

    await transaction.commit();

  } catch (e) {
    if(transaction) transaction.rollback();
    console.error(e);
    return res.status(500).send({status:'failed', errMsg: `Failed to update user ${id}.`});
    
  }

  return res.send({status:'success', msg:`User ${id} successfully updated.`});
}

User.read = async function(req, res){
    let mobile = req.params.mobile;
    let outlets;
    let user;
  
    try{
        user = await db.users.findOne({
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('mobile')), sq.fn('lower', mobile))
        });
    
        if(!user) return res.status(404).send({status: 'Failed', errMsg: 'User not found.'});

        let qOutlet = `
          select ua.outlet_id, o.account_id, o.name,
          o.address1 , o.address2 , o.address3 , o.postcode , o.city , o.state ,
          ua.active
          from user_account ua 
          inner join outlets o 
          on ua.outlet_id = o.id
          where ua.user_id = '${user.id}'
          order by ua.active desc,
          case when ua.active then ua.outlet_id else ua.outlet_id end asc
        `
        
        outlets = await sq.query(qOutlet, {
          type: sq.QueryTypes.SELECT,
          raw: true
        })
  
    }catch(e){
        console.error(e);
        return res.status(500).send({status: 'Failed', errMsg: 'Failed to find user.'})
    }
    
    return res.send({
      status: 'success',
      data: {
        user,
        outlets: {
          count: outlets.length,
          rows: outlets
        }
      }
    });
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

User.profile = async function(req, res){
  let user_id = req.token.user_id;
  

  let currentUser;
  
  try{
    // Fetch the current user's details
    currentUser = await db.users.findOne({
      where: { id: user_id },
      attributes: ['name', 'email']
    });


  }catch(e){
    console.error(e);
    return res.status(500).send({errMsg: 'Failed to get users.'});
  }
  
  return res.send({status: 'success', currentUser});
}

User.activate = async function (req, res) {
  let transaction;
  let user_id = req.params.id;

  // Ensure the current user is available and has a user_type
  if (!req.user || !req.user.user_type) {
      return res.status(403).send({ message: 'User type is missing or not authorized.' });
  }

  const updateActive = { active: true };
  const updateDeactive = { active: false };

  if (!user_id) return res.status(422).send({ errMsg: 'Missing User ID!' });

  let isUserIDExist = await db.users.findOne({
      where: {
          id: user_id,
      },
  });

  if (!isUserIDExist) return res.status(422).send({ errMsg: 'User ID is not valid' });

  if (req.user.user_type === 'admin') {
      try {
          transaction = await sq.transaction();

          let user = await db.users.findOne({
              where: { id: user_id },
          });

          if (user.active === false) {
              await db.users.update(updateActive, {
                  where: { id: user_id },
                  transaction,
              });
          } else {
              await db.users.update(updateDeactive, {
                  where: { id: user_id },
                  transaction,
              });
          }
          await transaction.commit();
          return res.status(200).send({ message: 'User status updated.' });
      } catch (e) {
          if (transaction && !transaction.finished) await transaction.rollback();
          console.error(e);
          return res.status(500).send({ errMsg: 'Internal Server Error' });
      }
  } else {
      res.status(403).send({
          message: 'Access Denied: This route is only accessible to ADMIN only',
      });
  }
};

User.activateCashier = async function (req, res) {
  let transaction;
  let user_id = req.params.id;

  // Ensure the current user is available and has a user_type
  if (!req.user || !req.user.user_type) {
      return res.status(403).send({ message: 'User type is missing or not authorized.' });
  }

  const updateActive = { active: true };
  const updateDeactive = { active: false };

  if (!user_id) return res.status(422).send({ errMsg: 'Missing User ID!' });

  try {
      // Check if the user ID exists and the user is a cashier
      let isUserCashier = await db.users.findOne({
          where: {
              id: user_id,
              user_type: 'cashier', // Only look for users with 'cashier' type
          },
      });

      if (!isUserCashier) return res.status(422).send({ errMsg: 'User ID is not valid or not a cashier.' });

      transaction = await sq.transaction();

      // Toggle the user's active status
      if (isUserCashier.active === false) {
          await db.users.update(updateActive, {
              where: { id: user_id },
              transaction,
          });
      } else {
          await db.users.update(updateDeactive, {
              where: { id: user_id },
              transaction,
          });
      }

      await transaction.commit();
      return res.status(200).send({ message: 'Cashier status updated successfully.' });

  } catch (e) {
      if (transaction && !transaction.finished) await transaction.rollback();
      console.error(e);
      return res.status(500).send({ errMsg: 'Internal Server Error' });
  }
};

module.exports = User;