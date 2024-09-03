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
    const { id, name, active, address1, address2, address3, postcode, city, state, account_id } = req.body;
    let user_id = req.user.id; 

    try {
        // Check if the user is authorized to create an outlet
        if (req.user.user_type === 'admin') { 

            if (!req.body.id || !req.body.name || !user_id) {
                return res.status(422).send({ errMsg: "Missing required fields" });
            }
            // Verify if the account exists and is active
            const account = await db.accounts.findOne({ where: { id: account_id, active: true } }); 

            if (!account) {return res.status(400).send({ errMsg: "The account does not exist or is not active." });
            }else { 
                try{ 
                    transaction = await sq.transaction(); 
                    // Create a new outlet record in the database
                    const newOutlet = await db.outlets.create({
                        id: req.body.id,
                        name: req.body.name,
                        active: req.body.active,
                        address1: req.body.address1, 
                        address2: req.body.address2,
                        address3: req.body.address3, 
                        postcode: req.body.postcode, 
                        city: req.body.city,
                        state: req.body.state,
                        account_id: req.body.account_id,
                        created_by: user_id,
                        created_at: created_at,
                        updated_by: user_id, 
                        updated_at: created_at
                    }, {transaction});
                    
                    await transaction.commit(); 
                    
                    // Send the newly created outlet data as a response
                    res.status(201).send({status : 'Success', message: 'Successfully created outlets'});

                }catch (e){ 
                    if (transaction) await transaction.rollback(); 
                    console.error(e) 
                }

            }

        } else { 
            res.status(403).send({ errMsg: "Only admins can access this API" });
        }
    } catch (error) {
        // Handle any errors
        console.error("Error creating outlet:", error);
        res.status(500).send({ error: "An error occurred while creating the outlet." });
    }
};

module.exports = Outlet;