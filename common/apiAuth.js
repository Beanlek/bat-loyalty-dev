const env = process.env.NODE_ENV || 'dev';
const db = require('../model/db.js');
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
const conf = require('../config/config.json')[env];
const sq = db.sequelize;

let Auth = {};

Auth.checkToken = async function(req, res, next){
  const bearerHeader = req.headers['authorization'];
  
  if(typeof bearerHeader == 'undefined') return res.sendStatus(403);

  const bearer = bearerHeader.split(' ');
  const token = bearer.length > 0 ? bearer[1] : null;
  
  if (!token) return res.sendStatus(403);

  try{
    let decoded = await jwt.verify(token, conf.cookie.secret);
    let user = await db.users.findOne({where: {id: {[Op.eq]: decoded.user_id}}});
    
    if(!user) throw `User ${decoded.user_id} not found.`;
    console.log(user.session_id)
    console.log(decoded.session_id)
    if(user.session_id != decoded.session_id) throw `User ${decoded.user_id} session id not matching.`;

    req.token = decoded;

    return next();

  }catch(e){
    console.error(e);
    return res.sendStatus(403);
  }
}

module.exports = Auth;
