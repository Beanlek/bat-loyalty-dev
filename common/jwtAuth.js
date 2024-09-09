const env = process.env.NODE_ENV || 'dev';
const db = require('../model/db.js');
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
const conf = require('../config/config.json')[env];
// const AccessControl = require('accesscontrol');
// const perms = require('../permissions/permissions');
// const ac = new AccessControl(perms);

let Auth = {};

Auth.checkTokenForLogin = async function(req, res, next){
  let token = req.cookies[conf.cookie.tokenName];
  
  try{
    let decoded = await jwt.verify(token, conf.cookie.secret);
    
    let user = await db.users.findOne({where: {id: {[Op.eq]: decoded.user_id}}});
    if(!user) throw `User ${decoded.user_id} not found.`;
    if(user.session_id != decoded.session_id) throw `User ${decoded.user_id} session id not matching.`;
    
    return res.redirect('/home');

  }catch(e){
    return next();
  }
};

Auth.checkToken = async function(req, res, next){
  let token = req.cookies[conf.cookie.tokenName];
  if(!token) return res.redirect('/login');
  try{
    let decoded = await jwt.verify(token, conf.cookie.secret);
    let user = await db.users.findOne({where: {id: {[Op.eq]: decoded.user_id}}});
    
    if(!user) throw `User ${decoded.user_id} not found.`;
    if(user.session_id != decoded.session_id) throw `User ${decoded.user_id} session id not matching.`;

    req.token = decoded;
    return next();

  }catch(e){
    console.error(e);
    return res.redirect('/login');
  }
};

module.exports = Auth;