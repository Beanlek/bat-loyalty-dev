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
 
let Loyalty_product = {}; 

let created_at = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
}).format(new Date());

Loyalty_product.insert = async function(req,res){ 
    let data = req.body.data;
    let loyalty_product;
    let transaction;

    // let user_id = req.user.id; 

    let id = data.id;
    let name = data.name;
    let brand = data.brand;
    let points = data.points;

    if(!id) return res.status(422).send({errMsg: 'Please enter id.'});
    if(!name) return res.status(422).send({errMsg: 'Please enter name.'});
    if(!brand) return res.status(422).send({errMsg: 'Please enter brand.'});
    if(!points) return res.status(422).send({errMsg: 'Please enter points.'});

    console.log(req.body.data);

    if (true){ 
        try { 
            loyalty_product = await db.loyalty_products.findOne({
                where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('id')), sq.fn('lower', id))
            });
        
            if(loyalty_product) return res.status(422).send({status:'failed', errMsg:'SKU already registered.'})

            transaction = await sq.transaction();

            const loyalty_products = await db.loyalty_products.create({  
                id : id, 
                name: name, 
                brand: brand, 
                points: points, 
                active: true, 
                // created_by: user_id, 
                created_by: 'Admin0001', 
                created_at: created_at, 
                // updated_by: user_id, 
                updated_by: 'Admin0001', 
                updated_at: created_at
            },{transaction}); 

            await transaction.commit(); 

            return res.status(201).send({ status: 'success', message: `Successfully added Product ${name}`});

        }catch(e) { 

            if (transaction) await transaction.rollback(); 
            console.error(e) 

        }  
    }else{ 
        res.status(403).send({
            status: 'failed',
            message: 'Access Denied: This route is only accessible to ADMIN only'
        })
    }
} 

Loyalty_product.getById = async function(req,res){ 
    let productId = req.params.id; 

    if(!productId) return res.status(422).send({errMsg: 'Missing Product ID!'}) 

    let singleProduct; 

    let isProductIdExist = await db.loyalty_products.findOne({ 
        where: { 
            id: productId
        }
    }) 

    if (!isProductIdExist) return res.status(422).send({errMsg: 'Product ID is not valid'});

    try { 
        singleProduct = await db.loyalty_products.findOne({ 
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

Loyalty_product.update = async function(req,res){ 
    let productId = req.params.id; 
    let transaction; 
    let updatedProduct; 

    if(!productId) return res.status(422).send({errMsg: 'Missing Product ID!'}); 

    let isProductIdExist = await db.loyalty_products.findOne({ 
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
        updatedProduct = await db.loyalty_products.update(updateOps, { 
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

// Loyalty_product.activate = async function(req,res){ 

// } 

// Loyalty_product.deactivate = async function(req,res){ 

// } 

Loyalty_product.list = async function(req,res){ 
    let loyalty_products;
             
    try{ 
                       
        const loyalty_products = await db.loyalty_products.findAll({ 
            attributes: ['id', 'name', 'brand', 'points', 'active'], 
           })  
            
        res.send({
            status: "success",
            data: {
                count: loyalty_products.length,
                rows: loyalty_products
            }
        }); 
    
    
    }catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
} 

module.exports = Loyalty_product; 