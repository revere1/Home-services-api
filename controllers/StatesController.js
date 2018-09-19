var models = require('../models');
var jwt = require('jsonwebtoken');
var config = require('./../config/config.json')['system'];
var utils = require('./../helpers/utils.js');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var async = require('async');
//var app   = require('../app');

exports.States = function (req, res, next) {
    let where = {};
    where['status'] = 'active';
    if (utils.objLen(req.query)) Object.assign(where, req.query);

    // find subsector
    models.states.findAll({
        attributes: ['id', 'name'],
        where: where
    }).then(function (states) {
        if (!states) {
            res.status(201).json({ success: false, message: 'States Not Found.' });
        } else if (states) {
            res.status(201).json({
                success: true,
                data: states
            });
        }
    });
}
exports.Createstates = function (request, response) {
    let postData = utils.DeepTrim(request.body);
    models.states.findOne({ where: { name: postData.name, country_id: postData.country_id }, required: false }).then(states => {
        let result = {};
        if (states) {
            result.success = false;
            result.message = 'state already existed.';
            response.json(result);
        } else {
            models.states.create(postData).then(states => {
                if (states) {
                    result.success = true;
                    result.message = 'State Successfully created';
                }
                else {
                    result.success = true;
                    result.message = 'State Not Successfully created';
                }
                response.json(result);
            });
        }
    });
};
//Get State based on Id
exports.GetState = (req, res) => {

    // models.countries.hasOne(models.user_profile);
    models.states.findOne({
        where: { id: req.params.id }
    }).then(states => {
        let response = {};
        if (states) {
            response.success = true;
            response.data = {
                'name': states.name,
                'status': states.status,
                'country_id':states.country_id,
                'id': states.id
            };
        }
        else {
            response.success = false;
            response.message = 'No State found';
        }
        res.json(response);
    });
}

exports.UpdateState = function (request, response) {
    let postData = utils.DeepTrim(request.body);
    models.states.findOne({ where: { id: postData.id }, required: false }).then(states => {
        let result = {};
        if (states) {
            states.updateAttributes(postData).then((updateState) => {
                if (updateState) {
                    result.success = true;
                    result.message = 'State Updated successfully ';
                } else {
                    result.success = true;
                    result.message = 'State Not Updated successfully ';
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
        else {
            result.success = false;
            result.message = 'State not existed.';
            response.json(result);
        }
    });
};
exports.FilterStates = (req, res)=>{
    filterStates(req, res,(records)=>{
            return res.json(records);
        });
}

filterStates = (req, res ,cb)=>{
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
            models.states.findAll({where: where,attributes:['id']}).then(projects => {                    
                callback(null,projects.length);
            }).catch(function (err) {
                callback(err);
            });                
        },
        (callback) => {
            models.states.findAll({ where: where,
                order: [
                    orderBy
                ],
                limit:pData.length, offset:pData.start})
            .then(states => {
                callback(null,states);
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
exports.DeleteState= function(request, response){
    // let id = request.params.id;
    let result = {};
    if(request.params.id != undefined){
        models.states.destroy({where: {id: request.params.id}}).then((rowDeleted)=>{
            result.success = true;
            result.message = (rowDeleted === 1) ? 'state deleted successfully' : 'Unable to delete state';
            response.json(result);
        },(err)=>{
            result.success = false;
            result.message = ' this state is already used by another user';
            response.json(result);
        })
    }
    else{
        result.success = false;
        result.message = 'Not selected any state';
        response.json(result);
    }   
};
