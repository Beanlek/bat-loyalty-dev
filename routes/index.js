const env = process.env.NODE_ENV || 'dev';
const conf = require('../config/config.json')[env];
var express = require('express');
var router = express.Router();
const jwtAuth = require('../common/jwtAuth');
const db = require('../model/db.js');
const Op = db.Sequelize.Op;

router.get('/', (req, res, next) => {
  res.redirect('/dashboard');
});

router.get('/dashboard', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('dashboard', {user_id, user_type});
});

router.get('/user_maintenance', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('user_maintenance', {user_id, user_type});
});

router.get('/ocr', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('ocr', {user_id, user_type});
});

router.get('/logout', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;
  let user = await db.users.findOne({where: {id: {[Op.eq]: user_id}}});

  user.session_id = null;
  await user.save();

  console.log('log out now');

  res.clearCookie(conf.cookie.tokenName);
  res.redirect('/');
});

module.exports = router;
