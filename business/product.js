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
 
let Product = {}; 

let created_at = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
}).format(new Date());

Product.insert = async function(req,res){ 
    let transaction; 
    let user_id = req.user.id; 
    const { id, name, brand, image, points, active, created_by, updated_by } = req.body;

    console.log("Request Body: ", req.body);
    console.log("User ID: ", user_id); 

    try{ 
        if (req.user.user_type === 'admin'){ 
            
            if (!req.body.id || !req.body.name || !user_id) {
                return res.status(422).send({ errMsg: "Missing required fields" });
            }else{ 
                try { 

                    transaction = await sq.transaction();

                    const product = await db.products.create({  
                        id : req.body.id, 
                        name: req.body.name, 
                        brand: req.body.brand, 
                        image: req.body.image, 
                        points: req.body.points, 
                        active: req.body.active, 
                        created_by: user_id, 
                        created_at: created_at, 
                        updated_by: user_id, 
                        updated_at: created_at
                    },{transaction}); 

                    await transaction.commit(); 

                    return res.status(201).send({ status: 'Success', message: `Successfully added Product #${name}`});

                }catch(e) { 

                    if (transaction) await transaction.rollback(); 
                    console.error(e) 

                }  
            }

        }else{ 
            res.status(403).send({
                message: 'Access Denied: This route is only accessible to ADMIN only'
            })
        }   
    }catch(error){
        console.error(error);
        return res.status(500).send({ errMsg: 'Internal Server Error' });
    }
} 

Product.getById = async function(req,res){ 
    let productId = req.params.id; 

    if(!productId) return res.status(422).send({errMsg: 'Missing Product ID!'}) 

    let singleProduct; 

    let isProductIdExist = await db.products.findOne({ 
        where: { 
            id: productId
        }
    }) 

    if (!isProductIdExist) return res.status(422).send({errMsg: 'Product ID is not valid'});

    try { 
        singleProduct = await db.products.findOne({ 
            where: { 
                id: productId
            }
        })
    }catch (e) { 
        console.error(e)
    }
    
    return res.send({ 
        status: 'Success', 
        data: singleProduct 
    }) 
    
};

Product.update = async function(req,res){ 
    let productId = req.params.id; 
    let transaction; 
    let updatedProduct; 

    if(!productId) return res.status(422).send({errMsg: 'Missing Product ID!'}); 

    let isProductIdExist = await db.products.findOne({ 
        where: { 
            id: productId
        }
    }) 

    if (!isProductIdExist) return res.status(422).send({errMsg: 'Product ID is not valid'});

    const updateOps = { 
        name: req.body.name,
        brand: req.body.brand,
        image: req.body.image, 
        points: req.body.points
    }

    try { 
        transaction = await sq.transaction(); 
        //not yet finished 
        updatedProduct = await db.products.update(updateOps, { 
            where: { id: productId}, 
            transaction
        });

        if (updatedProduct[0] === 0){ 
            await transaction.rollback(); 
            return res.status(404).send({errMsg: 'Product not found'})
        }

        await transaction.commit(); 
        res.status(200).send({message: 'Product updated successfully', updatedProduct}); 
        return id; 

    }catch (e) { 
        if (transaction) await transaction.rollback(); 
        console.error(e) 
        return res.status(500).send({errMsg: "Internal Server Error"});

    } 
    return res.status(200).send({status: 'Success', message: `Product ID = ${id} is updated`})
} 

// Product.activate = async function(req,res){ 

// } 

// Product.deactivate = async function(req,res){ 

// } 

Product.list = async function(req,res){ 
    let products; 
    try{ 
        const products = await db.products.findAll({ 
            attributes: ['id', 'name', 'brand', 'image', 'points'], 
            })  
        res.send(products); 
    }catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
} 

module.exports = Product; 