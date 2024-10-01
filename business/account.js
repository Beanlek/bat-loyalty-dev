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

let account = {};

let created_at = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
}).format(new Date());

account.list = async function (req,res){
    
    try {
        const account = await db.accounts.findAll();

        res.status(200).send(account);

    } catch (error){
        console.error("Error fetching account:",error);
        res.status(500).json({error:"An error occured while fetching account." });
    }
}

account.create = async function (req, res) {
    let transaction;

    try {
        const { id, name, active } = req.body; // Extract fields from request body
        const user_id = req.user.id;

        // Check if the user is an admin
        if (req.user.user_type !== 'admin') {
            return res.status(403).send({ errMsg: "Only admins can access this API" });
        }

        // Validate required fields
        if (!id || !name || !user_id) {
            return res.status(422).send({ errMsg: "Missing required fields" });
        }

        // Check if the account already exists
        const isAccountExists = await db.accounts.findOne({ where: { id } });
        if (isAccountExists) {
            return res.status(400).send({ errMsg: "The ID account already exists" });
        }

        // Transaction handling for creating a new account
        transaction = await sq.transaction();

        const newAccount = await db.accounts.create({
            id,
            name,
            active: 'true',
            created_by: user_id,
            created_at: created_at,
            updated_by: user_id,
            updated_at: created_at
        }, { transaction });

        // Commit the transaction after successful account creation
        await transaction.commit();
        return res.status(201).send({ status: 'Success', message: 'Successfully created account' });

    } catch (error) {
        // Rollback the transaction in case of any error
        if (transaction) await transaction.rollback();
        console.error("Error creating account:", error);
        return res.status(500).send({ error: "An error occurred while creating account." });
    }
};

account.activate = async function (req, res) {
    let transaction;
    let account_id = req.params.id;
  
    // Ensure the current user is available and has a user_type
    if (!req.user || !req.user.user_type) {
        return res.status(403).send({ message: 'User type is missing or not authorized.' });
    }
  
    const updateActive = { active: true };
    const updateDeactive = { active: false };
  
    if (!account_id) return res.status(422).send({ errMsg: 'Missing Account ID!' });
  
    let isAccountIDExist = await db.accounts.findOne({
        where: {
            id: account_id,
        },
    });
  
    if (!isAccountIDExist) return res.status(422).send({ errMsg: 'Account ID is not valid' });
  
    if (req.user.user_type === 'admin') {
        try {
            transaction = await sq.transaction();
  
            let account = await db.accounts.findOne({
                where: { id: account_id },
            });
  
            if (account.active === false) {
                await db.accounts.update(updateActive, {
                    where: { id: account_id },
                    transaction,
                });
            } else {
                await db.accounts.update(updateDeactive, {
                    where: { id: account_id },
                    transaction,
                });
            }
            await transaction.commit();
            return res.status(200).send({ message: 'Account status updated.' });
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

module.exports = account;