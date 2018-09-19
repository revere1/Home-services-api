var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser  = require('body-parser');
var morgan = require('morgan');
var cors = require('cors')
var multer = require("multer");
var app = module.exports = express();


/***********Start - email configurations ********/
var exphbs  = require('express-handlebars');
var  hbs = require('nodemailer-express-handlebars'),
    email = process.env.MAILER_EMAIL_ID || 'satya.bhxpro@gmail.com',
    pass = process.env.MAILER_PASSWORD || 'm92jc93s'
    nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
  auth: {
    user: email,
    pass: pass
  }
});

var handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve('./templates/'),
  extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

app.locals.smtpTransport = smtpTransport;
app.locals.path = path;
app.locals.appRoot = path.resolve(__dirname);
app.locals.appUploads = path.resolve(__dirname)+'/uploads/';



/***********End - email configurations ********/



app.use(cors());

app.use(express.static(path.join(__dirname, 'uploads')));

app.set('superSecret', 'globalequityesearchandrevere');

var url = require('url');
app.set('port', 1333);

//End

// use body parser so we can get info from POST and/or URL parameters
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json({type : '*/*'}));

app.use(bodyParser.json({limit: '50mb'}));

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


// use morgan to log requests to the console
app.use(morgan('dev'));


// send app to router
require('./router')(app);
require('./mobile_api_router')(app);

http.createServer(app).listen(app.get('port'), function(){  
  console.log('Express server listening on port ' + app.get('port'));
});
