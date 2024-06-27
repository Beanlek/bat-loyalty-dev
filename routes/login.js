const env = process.env.NODE_ENV || 'dev';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../model/db.js');
const jwt = require('jsonwebtoken');
const jwtAuth = require('../common/jwtAuth');
const conf = require('../config/config.json')[env];
const dayjs = require('dayjs');
const Op = db.Sequelize.Op;
const sq = db.sequelize;

const msgMissingParam = 'Please enter username and password (route/login.js)';
const msgLoginFailed = 'Invalid username or password';
const msgSignFailed = 'Failed to sign token';
const msgResetFailed ='Username not exist!'
const msgUserFound = 'Reset password link sent successfully!'
const msgEmailNotFound = 'No email address assigned to this profile. Please contact the system administrator.'

router.get('/', jwtAuth.checkTokenForLogin, (req, res) => {
  let token = req.query.token;
  
  try{
    if (token != null) {
      let decoded = jwt.verify(token, conf.cookie.secret);

      let user = db.users.findOne({where: {id: {[Op.eq]: decoded.user_id}}});
      if(!user) throw `User ${decoded.user_id} not found.`;

      res.cookie(conf.cookie.tokenName, token, {HttpOnly: true, secure: (env==='local' || env==='dev')? false : true});
      
      res.redirect('/dashboard');
    }
  }catch(e){
    console.error(e);
  }

  res.render('login');
});

router.post('/', async (req, res) => {
  let {username, password} = req.body;

  if(!username || ! password) {
    console.error(msgMissingParam);
    return res.render('login', {error: msgMissingParam});
  }

  let user;
  let token;
  let expires_in = '36h';
  let token_expiry_time;

  try{
    user = await db.users.findOne({
      where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('id')), sq.fn('lower', username))
    });
  }catch(e){
    console.error(e);
    return res.render('login', {error: msgLoginFailed})
  }
  
  if(!user){
    return res.render('login', {error: msgLoginFailed});
  }
  
  if(user.dataValues.locked || !user.active){
    return res.render('login', {error: msgLoginFailed});
  }

  let valid = await bcrypt.compare(password, user.password);
  if(!valid) {
    console.error('Wrong password.');
    return res.render('login', {error: msgLoginFailed});
  }
  
  user.last_login_at = new Date();
  user.session_id = uuidv4();
  await user.save();
  
  let _tkn = {
    user_id: user.id,
    user_type: user.user_type,
    session_id: user.session_id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    last_login_at: user.last_login_at
  };

  try{
    token = jwt.sign(_tkn, conf.cookie.secret,{expiresIn: expires_in});
    token_expiry_time = dayjs(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp * 1000);

    // cookie secure attribute prevents cookie from being used in http.
    res.cookie(conf.cookie.tokenName, token);
  } catch(err){
    console.error(msgSignFailed);
    console.log({err})
    return res.render('login', {error: msgSignFailed});
  }
  console.log('go here!!!!')
  return res.redirect('/dashboard');
});

router.all('*', (req, res)=>{
  res.redirect('/login');
})

module.exports = router;
