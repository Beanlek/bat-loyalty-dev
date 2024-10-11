const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const nocache = require('nocache');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); 
const multer = require('multer'); 
const sharp = require('sharp'); 
const fs = require('fs');

//Mobile
const indexRouter = require('./routes/index');
const apiAuthRouter = require('./routes/api_auth');
const apiUserRouter = require('./routes/api_user'); 
const apiProductRouter = require('./routes/api_product'); 
const apiAccountRouter = require('./routes/api_account'); 
const apiOutletRouter = require('./routes/api_outlet'); 

//Web
const productRouter = require('./routes/a_product'); 
const outletRouter = require('./routes/a_outlet');
const ocrRouter = require('./routes/a_ocr'); 
const loyaltyProductRouter = require('./routes/a_loyalty_product'); 
const s3Router = require('./routes/a_s3');

const app = express();

app.use(express.json()); 
// app.use(express.urlencoded({ extended: true })); 

//Web Router
app.use('/a/product', productRouter); 
app.use('/a/outlet', outletRouter); 
app.use('/a/ocr', ocrRouter); 
app.use('/a/loyalty_product', loyaltyProductRouter);
app.use('/a/s3', s3Router); 

// app.use('/', indexRouter); 
//Mobile Router 
app.use('/api/auth', apiAuthRouter); 
app.use('/api/user', apiUserRouter); 
app.use('/api/product', apiProductRouter);  
app.use('/api/account', apiAccountRouter); 
app.use('/api/outlet', apiOutletRouter); 


// --- catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));  
});

app.get('/test', (req, res) => {
    res.status(200).send('Server Connected'); 
})


// --- error handler
app.use(function(err, req, res, next) {
    if(err.status == 404) {
    if(req.originalUrl.startsWith('/a/')){
        return res.status(404).send('API not found');
    }
    return res.redirect('/login');
    }
    
    if(err instanceof multer.MulterError){ 
        if(err.code === "LIMIT_FILE_SIZE"){ 
            return res.status(400).json({ 
                message: "File size is too large",
            })
        }  
        if(err.code === "LIMIT_FILE_COUNT") { 
            return res.status(400).json({ 
                message: "File limit reached",
            })
        } 
        if(err.code === "LIMIT_UNEXPECTED_FILE") { 
            return res.status(400).json({ 
                message: "File must be an image",
            })
        } 
    }

    console.error(err);
    if (!err.filename || !err.line || !err.column) {
    console.log('New route introduced and its permission is not setup!')
    }

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page  
    res.status(err.status || 500);
    res.render('error', { err });
});

module.exports = app;