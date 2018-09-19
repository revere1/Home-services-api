var models = require('../models');
var Sequelize = require('sequelize');
var jwt = require('jsonwebtoken');
var config = require('./../config/config.json')['system'];
var utils = require('./../helpers/utils.js');
const Op = Sequelize.Op;
var async = require('async');
//var app   = require('../app');
//Get Country based on Id
exports.GetCountry = (req, res) => {
    models.countries.findOne({
        where: { id: req.params.id }
    }).then(countries => {
        let response = {};
        if (countries) {
            response.success = true;
            response.data = {
                'name': countries.name,
                'status': countries.status,
                'id': countries.id
            };
        }
        else {
            response.success = false;
            response.message = 'No Country found';
        }
        res.json(response);
    });
}

exports.UpdateCountry = function(request, response){
    let postData = utils.DeepTrim(request.body);
    models.countries.findOne({ where: {id: postData.id}, required: false}).then(countries => {
        let result = {};
        if(countries){                     
            countries.updateAttributes(postData).then((updateCountry)=>{
                if(updateCountry){
                    result.success = true;
                    result.message = 'Country Updated successfully ';
                }else{
                    result.success = true;
                    result.message = 'Country Not Updated successfully '; 
                }
                response.json(result);   
            }).catch(Sequelize.ValidationError, function (err) {
                // respond with validation errors                
                return response.status(200).json({
                    success: false,
                    message: err.message
                });
            }).catch(function (err) {
                // every other error                
                return response.status(400).json({
                    success: false,
                    message: err
                });
            });
        }
        else{
            result.success = false;
            result.message = 'country not existed.';
            response.json(result);           
        }       
    });   
};

exports.Createcountries = function (request, response) {
    let postData = utils.DeepTrim(request.body);
    models.countries.findOne({ where: { name: postData.name } }).then(countries => {
        let result = {};
        if (countries) {
            result.success = false;
            result.message = 'Country already existed.';
            response.json(result);
        } else {
            models.countries.create(postData).then(countries => {
                if (countries) {
                    result.success = true;
                    result.message = 'Country Successfully created';
                }
                else {
                    result.success = true;
                    result.message = 'Country Not Successfully created';
                }
                response.json(result);
            });
        }
    });
};

exports.Countries = function (req, res, next) {
    let where = {};
    where['status'] = 'active';
    if (utils.objLen(req.params)) Object.assign(where, req.params);
    // find subsector
    models.countries.findAll({
        attributes: ['id', 'name'],
        where: where
    }).then(function (countries) {
        if (!countries) {
            res.status(201).json({ success: false, message: 'Countries Not Found.' });
        } else if (countries) {
            res.status(201).json({
                success: true,
                data: countries
            });
        }
    });
}


exports.FilterCountries = (req, res)=>{
    filterCountries(req, res,(records)=>{
            return res.json(records);
        });
}

filterCountries = (req, res ,cb)=>{
    pData = req.body;
    where = sort = {};
    if(pData.columns.length){       
        (pData.columns).forEach(col => {           
            if((col.search.value).length){
                let cond = {};
                cond[col.data] = col.search.value;
                Object.assign(where,cond);
            }          
        });
        if((pData.search.value).length){
            let likeCond = [];
            (pData.columns).forEach(col => {
                let item = {
                        [col.data] : {
                            [Op.like] : `%${pData.search.value}%`
                        }
                    }   
                likeCond.push(item);
            });
            where = {[Op.or] : likeCond};
        }      
    }   
    let orderBy = [pData.columns[pData.order[0].column].data , pData.order[0].dir];
    async.parallel([
        (callback) => {
            models.countries.findAll({where: where,attributes:['id']}).then(projects => {                    
                callback(null,projects.length);
            }).catch(function (err) {
                callback(err);
            });                
        },
        (callback) => {
            models.countries.findAll({ where: where,
                order: [
                    orderBy
                ],
                limit:pData.length, offset:pData.start})
            .then(countries => {
                callback(null,countries);
            })
            .catch(function (err) {
                callback(err);
            });                        
        }
    ],(err,results) => {
            let json_res = {};
            json_res['draw'] = pData.draw;
        if(err){            
            json_res['success'] = false;
            json_res['recordsTotal'] = 0;
            json_res['recordsFiltered'] = 0;
            json_res['message'] = err;    
            json_res['data'] = [];              
        }
        else{
            json_res['success'] = true;
            json_res['recordsTotal'] = results[0];
            json_res['recordsFiltered'] = results[0];
            json_res['data'] = results[1];
        }                   
        cb(json_res);
    })
};

exports.DeleteCountry = function(request, response){
    // let id = request.params.id;
    let result = {};
    if(request.params.id != undefined){
        models.countries.destroy({where: {id: request.params.id}}).then((rowDeleted)=>{
            result.success = true;
            result.message = (rowDeleted === 1) ? 'country deleted successfully' : 'Unable to delete country';
            response.json(result);
        },(err)=>{
            result.success = false;
            result.message = 'you must delete states in this country or this Country is already use another user ';
            response.json(result);
        })
    }
    else{
        result.success = false;
        result.message = 'Not selected any country';
        response.json(result);
    }   
};
