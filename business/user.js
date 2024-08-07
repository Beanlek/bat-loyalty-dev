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

    if(!security_image) return res.status(422).send({errMsg: 'Please choose security image.'});
    if(!security_phrase) return res.status(422).send({errMsg: 'Please choose security phrase.'});

    if(Password.score(password) < 4) {
      return res.status(422).send({errMsg: 'Password complexity requirement not met.'});
    }
  
    let transaction;
    let user;
    let phone;

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
    
        transaction = await sq.transaction();
    
        let hash = bcrypt.hashSync(password, conf.saltRounds);
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
User.read = async function(req, res){
    let mobile = req.params.mobile;
    let user;
  
    try{
        user = await db.users.findOne({
            where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('mobile')), sq.fn('lower', mobile))
        });
    
        if(!user) return res.status(404).send({status: 'Failed', errMsg: 'User not found.'});
  
    }catch(e){
        console.error(e);
        return res.status(500).send({status: 'Failed', errMsg: 'Failed to find user.'})
    }
    
    return res.send({user});
}

module.exports = User;