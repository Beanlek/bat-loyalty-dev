const env = process.env.NODE_ENV || 'dev';
const db = require('../model/db.js');
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
const conf = require('../config/config.json')[env];
// const AccessControl = require('accesscontrol');
// const perms = require('../permissions/permissions');
// const ac = new AccessControl(perms);

let Auth = {};

Auth.checkTokenForApi = async function(req, res, next){
  let token = req.cookies[conf.cookie.tokenName];
  try{
    let decoded = await jwt.verify(token, conf.cookie.secret);
    let user = await db.users.findOne({where: {id: {[Op.eq]: decoded.user_id}}});

    if(!user) throw `User ${decoded.user_id} not found.`;
    if(user.session_id != decoded.session_id) throw `User ${decoded.user_id} session id not matching.`;

    req.token = decoded;
    req.user = user; 

    return next();

  }catch(e){
    console.error(e);
    return res.status(401).end('Unauthorized');
  }
};

// Auth.checkTokenForChangePassword = async function(req,res,next){
//   let token = req.cookies[conf.cookie.tokenName];

//   try{
//     let decoded = await jwt.verify(token, conf.cookie.secret);
    
//     let user = await db.users.findOne({where: {id: {[Op.eq]: decoded.user_id}}});
//     if(!user) throw `User ${decoded.user_id} not found.`;
//     if(user.session_id != decoded.session_id) throw `User ${decoded.user_id} session id not matching.`;

//     req.token = decoded;
//     return next();

//   }catch(e){
//     console.error(e);
//     return res.redirect('/login');
//   }
// }

// Auth.checkRole = async function(req, res, next){
//   let token = req.cookies[conf.cookie.tokenName];
//   try{
//     let decoded = await jwt.verify(token, conf.cookie.secret);

//     let user_role = req.token.role;

//     let permission = ac.can(user_role);

//     const thePath = req.baseUrl;
//     const route = req.route;

//     let pageId = thePath.substring(thePath.lastIndexOf('/')+1);
//     let canCreate = permission.createAny(`${pageId}`).granted;
//     let canUpdate = permission.updateAny(`${pageId}`).granted;
    
//     if (route.path.includes('create'))
//     {
//       if (!canCreate) return res.status(422).send({errMsg: 'Unauthorized'});
//     }
//     else if (route.path.includes('update'))
//     {
//       if (!canUpdate) return res.status(422).send({errMsg: 'Unauthorized'});
//     }
    
//     return next();

//   }catch(e){
//     console.error(e);
//     return res.status(401).end('Unauthorized');
//   }
// };

// Auth.checkTokenForLogin = async function(req, res, next){
//   let token = req.cookies[conf.cookie.tokenName];
  
//   try{
//     let decoded = await jwt.verify(token, conf.cookie.secret);
    
//     let user = await db.users.findOne({where: {id: {[Op.eq]: decoded.user_id}}});
//     if(!user) throw `User ${decoded.user_id} not found.`;
//     if(user.session_id != decoded.session_id) throw `User ${decoded.user_id} session id not matching.`;
//     return res.redirect('/home');

//   }catch(e){
//     return next();
//   }
// };

module.exports = Auth;