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
const { where } = require('sequelize');
const Op = db.Sequelize.Op;
const sq = db.sequelize;
const df = 'YYYY-MM-DD';
const limit = 20; 

let user_account = {};

let created_at = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
}).format(new Date());

user_account.list = async function (req,res){
    try {
        const user_account = await db.user_accounts.findAll();

        res.status(200).send(user_account);

    } catch (error){
        console.error("Error fetching user_account:",error);
        res.status(500).json({error:"An error occured while fetching user_account." });
    }
}

user_account.insert = async function (req, res) {
    let data = req.body.data; console.log(data);

    let user_id = req.params.user_id; // username
    let outlet_id = data.outlet_id

    if(!user_id) return res.status(422).send({errMsg: 'Forbidden'});
    if(!outlet_id) return res.status(422).send({errMsg: 'Please enter outlet_id.'});

    let user_account = await db.user_accounts.findOne({
        where: {
            user_id: { [Op.eq]: user_id},
            outlet_id: { [Op.eq]: outlet_id},
        },
    });
    
    if(user_account) return res.status(422).send({status:'failed', errMsg:'Outlet is already added.'})

    let outlet = await db.outlets.findOne({
        where: {
            id: { [Op.eq]: outlet_id},
        },
    });
    
    if(!outlet) return res.status(422).send({status:'failed', errMsg:'Outlet does not exist.'})

    let transaction;
    transaction = await sq.transaction();

    try {
        await db.user_accounts.create({  
            user_id : user_id, 
            outlet_id : outlet_id, 

            created_by: user_id, 
            created_at: created_at, 
            updated_by: user_id, 
            updated_at: created_at
        },{transaction}); 

        await transaction.commit(); 

    } catch (e) {
        if(transaction) transaction.rollback();
        console.error(e);
        return res.status(500).send({status:'failed', errMsg: `Failed to update user ${id}.`}); 
    }

    return res.send({status:'success', msg:`Outlet ${outlet_id} successfully added to user ${user_id}.`});
}

user_account.updateActive = async function (req,res) {
    let data = req.body.data; console.log(data);

    let user_id = data.user_id
    let outlet_id = data.outlet_id
    let active = data.active

    if(!user_id) return res.status(422).send({errMsg: 'Please enter user_id.'});
    if(!outlet_id) return res.status(422).send({errMsg: 'Please enter outlet_id.'});
    if(active == null) return res.status(422).send({errMsg: 'Please enter active.'});

    let transaction;
    transaction = await sq.transaction();

    try {
        await db.user_accounts.update({
            active: active
        },{
            where: {
                user_id: { [Op.eq]: user_id},
                outlet_id: { [Op.eq]: outlet_id},
            },
            raw: true, logging: console.log, 
            transaction
        })
        
        await transaction.commit();

    } catch (e) {
        if(transaction) transaction.rollback();
        console.error(e);
        return res.status(500).send({status:'failed', errMsg: `Failed to update user ${id}.`});
    }

    return res.send({status:'success', msg:`Outlet successfully reactivated / deactivated.`});

}

module.exports = user_account;