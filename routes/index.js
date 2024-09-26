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

router.get('/process_receipt', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('process_receipt', {user_id, user_type});
});

router.get('/account_maintenance', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('account_maintenance', {user_id, user_type});
});

router.get('/product_maintenance', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('product_maintenance', {user_id, user_type});
});

router.get('/inventory_management', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('inventory_management', {user_id, user_type});
});

router.get('/redemption_management', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('redemption_management', {user_id, user_type});
});

router.get('/program_management', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('program_management', {user_id, user_type});
});

router.get('/miscellaneous_report', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('miscellaneous_report', {user_id, user_type});
});

router.get('/settings', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('settings', {user_id, user_type});
});

router.get('/outlet', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('outlet', {user_id, user_type});
});

router.get('/outlets', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('outlets', {user_id, user_type});
});
router.get('/cashier', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('cashier', {user_id, user_type});
});
router.get('/create_account', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('create_account', {user_id, user_type});
});
router.get('/create_outlet', jwtAuth.checkToken, async (req, res, next)=>{
  let {user_id, user_type} = req.token;

  return res.render('create_outlet', {user_id, user_type});
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
