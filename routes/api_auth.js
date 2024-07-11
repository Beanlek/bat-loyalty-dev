const env = process.env.NODE_ENV || 'dev';
var express = require('express');
var router = express.Router();
const db = require('../model/db.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const conf = require('../config/config.json')[env];
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const sq = db.sequelize;

const msgMissingParam = 'Please enter username and password';
const msgLoginFailed = 'Invalid username or password';
const msgSignFailed = 'Failed to sign token';
const msgResetFailed ='Username not exist!'
const msgUserFound = 'Reset password link sent successfully!'
const msgEmailNotFound = 'No email address assigned to this profile. Please contact the system administrator.'


router.post('/app/login', async (req, res) => {
    let token;
    let expires_in = '36h';
    let token_expiry_time;
    let allotment_date;

    var {mobile, password, device_id} = req.body;

    if(!mobile || ! password || !device_id) {
        console.error(msgMissingParam);
        return res.status(422).send({errMsg: msgMissingParam});
    }

    let user = await db.users.findOne({
        where: {
            [db.Sequelize.Op.or]: [{ id: mobile }, { mobile: mobile }],
        },
    });

    if(!user){
        return res.status(422).send({errMsg: msgLoginFailed});
    }

    let valid = await bcrypt.compare(password, user.password);
    if(!valid) {
        await user.save();
        console.error('Wrong password.');
        return res.status(422).send({errMsg: msgLoginFailed});
    }

    user.last_login_at = new Date();
    user.session_id = uuidv4();
    await user.save();

    console.log(user)

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
        
    } catch(err){
        console.error(msgSignFailed);
        return res.status(422).send({status: 'failed', errMsg: msgSignFailed});
    }

    let status = 'success'
    return res.json({status, token, token_expiry_time, allotment_date});
    }
);

router.all('/*', (req, res) => {
    res.status(404).send('API not found');  
})

module.exports = router;