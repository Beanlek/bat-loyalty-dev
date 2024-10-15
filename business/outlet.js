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

let Outlet = {}; 

let created_at = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
}).format(new Date());

Outlet.list = async function (req,res){
    try {
        const outlets = await db.outlets.findAll();

        res.status(200).send(outlets);

    } catch (error){
        console.error("Error fetching outlets:",error);
        res.status(500).json({error:"An error occured while fetching outlets." });
    }
}

Outlet.create = async function (req, res) {
    let transaction;
    const { id, name, address1, address2, address3, postcode, city, state, account_id } = req.body;
    const user_id = req.user.id;

    try {
        // Check if the user is authorized to create an outlet
        if (req.user.user_type !== 'admin') {
            return res.status(403).send({ status: 'Error', message: "Only admins can access this API" });
        }

        // Validate required fields
        if (!id || !name || !user_id) {
            return res.status(422).send({ status: 'Error', message: "Missing required fields" });
        }

        // Verify if the account exists and is active
        const account = await db.accounts.findOne({ where: { id: account_id, active: true } });
        if (!account) {
            return res.status(400).send({ status: 'Error', message: "The account does not exist or is not active." });
        }

        // Start a transaction
        transaction = await sq.transaction();

        try {
            // Create a new outlet record in the database
            const newOutlet = await db.outlets.create({
                id: id,
                name: name,
                active: true,
                address1: address1,
                address2: address2,
                address3: address3,
                postcode: postcode,
                city: city,
                state: state,
                account_id: account_id,
                created_by: user_id,
                created_at: created_at, 
                updated_by: user_id,
                updated_at: created_at 
            }, { transaction });

            // Commit the transaction if everything is successful
            await transaction.commit();

            // Send success response after successful transaction
            return res.status(201).send({ status: 'Success', message: 'Successfully created outlet', outlet: newOutlet });

        } catch (error) {
            // Rollback transaction if there is an error
            if (transaction) await transaction.rollback();

            // Log the error and send a failure response
            console.error('Error creating outlet:', error);
            return res.status(500).send({ status: 'Error', message: 'An error occurred while creating the outlet.' });
        }

    } catch (error) {
        // Log the error and send a failure response if something goes wrong
        console.error('Error during outlet creation:', error);
        return res.status(500).send({ status: 'Error', message: 'An unexpected error occurred.' });
    }
};

Outlet.activate = async function (req, res) {
    let transaction;
    let outlet_id = req.params.id;

    // Ensure the current user is available and has a user_type
    if (!req.user || !req.user.user_type) {
        return res.status(403).send({ message: 'User type is missing or not authorized.' });
    }

    const updateActive = { active: true };
    const updateDeactive = { active: false };

    if (!outlet_id) return res.status(422).send({ errMsg: 'Missing Outlet ID!' });

    let isOutletIDExist = await db.outlets.findOne({
        where: {
            id: outlet_id,
        },
    });

    if (!isOutletIDExist) return res.status(422).send({ errMsg: 'Outlet ID is not valid' });

    if (req.user.user_type === 'admin') {
        try {
            transaction = await sq.transaction();

            let outlet = await db.outlets.findOne({
                where: { id: outlet_id },
            });

            if (outlet.active === false) {
                await db.outlets.update(updateActive, {
                    where: { id: outlet_id },
                    transaction,
                });
            } else {
                await db.outlets.update(updateDeactive, {
                    where: { id: outlet_id },
                    transaction,
                });
            }
            await transaction.commit();
            return res.status(200).send({ message: 'Outlet status updated.' });
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

module.exports = Outlet;