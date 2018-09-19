var models = require('../../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var jwt = require('jsonwebtoken');
var config = require('./../../config/config.json')['system'];
var utils = require('./../../helpers/utils');
var crypto = require('crypto');
var multer = require('multer')
var async = require('async');
var md5 = require('md5');
var fs = require('fs');
var db = require('./../../models/index');


exports.Register = (req,res)=>
{
    let postData = req.body;

    models.mobile_users.findOne({ where: { user_email: postData.user_email} }).then(mobile_user => {
        let result = {};
        if (mobile_user) {
            result.success = false;
            result.message = 'User already existed.';
            res.json(result);
        }
        else {

            if (postData.password == ''  || postData.length < 6 || postData.length >20) {
                result.success = false;
                result.message = 'Password should be between 6,20 characters';
                response.json(result);
            }else{
                postData.password = models.mobile_users.generateHash(postData.password);
            }

            postData = utils.DeepTrim(postData);
            models.mobile_users.create(postData).then(user1 => {
                if (user1){                              
                        result.success = true;
                        result.message = 'User successfully created';
                        res.json(result);
                }
                else{
                    noResults(result, res)
                }
            }).catch(function (err) {
                result.success = false;
                errs = [];
                (err.errors).forEach(er => {           
                   errs.push(er.message);     
                });
                result.message = errs.join(',');
                res.json(result);
              });
        }
    });    
};



exports.Login = (req,res)=>
{
    if(req.body.user_name != '' && req.body.password != '')
    {

    
    let postData = req.body;
    models.mobile_users.findOne({
        where: {
            user_email: postData.user_name
        }        
    }).then(function (user) {
        if (!user) {
            res.status(201).json({ success: false, message: 'Incorrect login credentials.' });
        } else if (user) {
            
            if (user._modelOptions.instanceMethods.validPassword(req.body.password, user)) {

                var token = jwt.sign(user.toJSON(), config.jwt_app_secretkey, {
                    expiresIn: config.jwt_app_expire
                });
                res.status(201).json({
                    success: true,
                    data: {
                        'user_id': user.id,
                        'email': user.user_email,
                        'user_name': user.user_name,
                        'status': user.status,
                        'registerdAt': user.createdAt
                    },
                    token: token
                });
            }
            else {
                res.status(201).json({ success: false, message: 'Incorrect login credentials.' });
            }
        }
    }).catch(function (err) {
        // let result = {};
        // result.success = false;
        // errs = [];
        // (err.errors).forEach(er => {           
        //    errs.push(er.message);     
        // });
        // result.message = errs.join(',');
        res.json(err);
      });
    }else{
        res.status(201).json({ success: false, message: 'Username/Password should not be empty' });
    }
    
};


exports.saveUserAddress = function(req,res){
    let postData = req.body;
    let result = {};
    let aerrs = [];

    if(isNaN(postData.user_id )){
        aerrs.push('Invalid user');
    }
    if(postData.full_name == '' || postData.full_name.length < 2 ||  postData.full_name.length > 50){
        aerrs.push('Name should be in betwwen 3 to 50 characters');
    }
    if(postData.address1 == ''){
        aerrs.push('Address1 should not be empty');
    }
    if(postData.address2 == ''){
        aerrs.push('Address2 should not be empty');
    }
    if(postData.city == ''){
        aerrs.push('City should not be empty');
    }
    if(postData.state == ''){
        aerrs.push('State should not be empty');
    }
    if(postData.country == ''){
        aerrs.push('Country should not be empty');
    }
    if(isNaN(postData.contact_number ) || postData.contact_number.length < 10 ||  postData.contact_number.length > 12){
        aerrs.push('Invalid mobile number');
    }
    if(isNaN(postData.postal_code ) || postData.postal_code.length < 6 ||  postData.postal_code.length > 8){
        aerrs.push('Invalid posatl code');
    }
if(aerrs.length > 0){
    res.json({success:false,aerrors:aerrs});
}else{

    models.mobile_user_address.create(postData).then((saddr)=>{
        if(saddr)
        {
            if(postData.default_address == 1){
                models.mobile_user_address.update({default_address:0},{where:{user_id:uid}}).then(data => {
                    result.success = true;
                    result.message = 'User address successfully added';
                    res.json(result);
                });
            }else{
                result.success = true;
            result.message = 'User address successfully added';
            res.json(result);
            }
            
        }
    else{
        noResults(result, res)
    }
}).catch(Sequelize.ValidationError, function (err) {
    return response.status(200).json({
            success: false,
            message: err.message
    });
}).catch(function (err) {
                                  
    return response.status(400).json({
            success: false,
            message: err
    });
});
}
    
}

exports.getUserAddresses = function(req,res){
    let user_id = req.body.user_id;
    let results = {};
    if(user_id != '')
    {
        models.mobile_user_address.findAll({
            where:{
                user_id : user_id
            }
        }).then(function(adrs){
    let results = {};
            results.success = true;
            results.addresses = adrs;
            res.json(results);
        }).catch(function (err) {
            return response.status(400).json({
                success: false,
                message: err
            });
        });
    }
    else
    {
        results.success = false;
        results.message = 'Invalid request, user id missed';
    }

}
exports.authenticate = function (req, res, next) {

    // check header or url parameters or post parameters for token

    var token = req.body.token || req.query.token || req.headers['authorization'] || req.headers['Authorization'];
    if (token) {
        jwt.verify(token, config.jwt_app_secretkey, function (err, decoded) {
            if (err) {
                return res.status(201).json({ success: false, message: 'Authenticate token expired, please login again.', errcode: 'exp-token' });
            } else {
                req.decoded = decoded;
                req.app.locals.decodedData = decoded;
                next();
            }
        });
    } else {
        return res.status(201).json({
            success: false,
            message: 'Fatal error, Authenticate token not available.',
            errcode: 'no-token'
        });
    }
}

exports.VerifyApiCode = function(req, res, next)
{
    var api_code = req.body.api_code || req.query.api_code;
   
    if(api_code)
    {
        if(config.api_code == api_code)
        {
            next();
        }
        else
        {
            return res.status(201).json({ success: false, message: 'Invalid Request.', errcode: 'invalid-request' });
        }
    }
    else
    {
            return res.status(401).json({ success: false, message: 'You are not allowed to access this request', errcode: 'invalid-request' });
    }    
};

noResults = (result, response) => {
    result.success = 'failure';
    result.message = 'Something went wrong';
    response.json(result);
}
