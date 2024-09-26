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

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const userRouter = require('./routes/a_user');
const outletRouter = require('./routes/a_outlet');
const userAccountRouter = require('./routes/a_user_account');
const accountRouter = require('./routes/a_account');

const apiAuthRouter = require('./routes/api_auth');
const apiUserRouter = require('./routes/api_user');
const apiOutletRouter = require('./routes/api_outlet');


const app = express();

app.use(express.json());
app.use(express.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser());

// pug engine (required)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery')));
app.use('/select2', express.static(path.join(__dirname, 'node_modules/select2')));

// logging
logger.token('body', (req, res) => JSON.stringify(req.body));
logger.format('customFormat', ':method :url :status :response-time ms - :res[content-length] :body');
app.use(logger('customFormat'));

// web pages
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/a/user', userRouter);
app.use('/a/outlet', outletRouter);
app.use('/a/user_account',userAccountRouter);
app.use('/a/account', accountRouter);


// app api
app.use('/api/auth', apiAuthRouter);
app.use('/api/user', apiUserRouter);
app.use('/api/outlet',apiOutletRouter);



// 404 error handler
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