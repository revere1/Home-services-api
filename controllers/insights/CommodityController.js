var models = require('../../models');
var Sequelize = require('sequelize');
var jwt = require('jsonwebtoken');
var config = require('./../../config/config.json')['system'];
var utils = require('./../../helpers/utils.js');
const Op = Sequelize.Op;
var async = require('async');


exports.CommodityTypes = (req,res)=>{
    models.commodities.findAll().then(data=>{
        let result = {};
        result.success  =true;
        result.data = [];
        if(data){
            result.data = data;
        }
        res.json(result);
    })
}

exports.CreateCommodity = function (request, response) {
    let postData = request.body;

    models.commodities.findOne({ where: { name: postData.name } }).then(commodities => {
        let result = {};
        if (commodities) {
            result.success = false;
            result.message = 'commodity already existed.';
            response.json(result);
        } else {
            models.commodities.create(postData).then(commodities => {
                if (commodities) {
                    result.success = true;
                    result.message = 'Commodity Successfully created';
                    result.data = commodities;
                }
                else {
                    result.success = true;
                    result.message = 'Commodity Not Successfully created';

                }
                response.json(result);
            });
        }

    });
};
exports.DeleteCommodity = function(request, response){
    // let id = request.params.id;
    let result = {};
    if(request.params.id != undefined){
        models.commodities.destroy({where: {id: request.params.id}}).then((rowDeleted)=>{
            result.success = true;
            result.message = (rowDeleted === 1) ? 'commodity deleted successfully' : 'Unable to delete commodity';
            response.json(result);
        })
        // ,(err)=>{
        //     result.success = false;
        //     result.message = 'you must delete states in this country or this Country is already use another user ';
        //     response.json(result);
        // })
    }
    else{
        result.success = false;
        result.message = 'Not selected any commodity';
        response.json(result);
    }   
};

exports.GetCommodity = (req, res) => {
    models.commodities.findOne({
        where: { id: req.params.id }
    }).then(commodities => {
        let response = {};
        if (commodities) {
            response.success = true;

            response.data = {
                'name': commodities.name,
                'id': commodities.id
            };
        }
        else {
            response.success = false;
            response.message = 'No Commodity found';
        }
        res.json(response);
    });
}


exports.UpdateCommodity = function(request, response){
    let postData = request.body;
    models.commodities.findOne({ where: {id: request.params.id}, required: false}).then(commodities => {
        let result = {};
        if(commodities){                     
            commodities.updateAttributes(postData).then((updateCommodity)=>{
                if(updateCommodity){
                    result.success = true;
                    result.message = 'Commodity Updated successfully ';
                }else{
                    result.success = true;
                    result.message = 'Commodity Not Updated successfully '; 
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
            result.message = 'Commodity not existed.';
            response.json(result);           
        }       
    });   
};

exports.FilterCommodities = (req, res)=>{

    filterCommodities(req, res,(records)=>{
            return res.json(records);
        });
}

filterCommodities = (req, res ,cb)=>{
    models.commodities.belongsTo(models.users,{foreignKey:'createdBy'})
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
            likeCond.push(Sequelize.where(Sequelize.fn('concat', Sequelize.col(`user.first_name`), ' ', Sequelize.col(`user.last_name`)), {
                like: '%' + pData.search.value + '%'
            }));
            where = {[Op.or] : likeCond};
        }      
    }
   
    let orderBy = [pData.columns[pData.order[0].column].data , pData.order[0].dir];

    async.parallel([
        (callback) => {
            models.commodities.findAll({where: where,attributes:['id'],
            include:[
                {
                    model:models.users,
                    attributes: [ [Sequelize.literal ('concat(`user`.`first_name`," ",`user`.`last_name`)'), 'Name']]
                }
            ],
            raw:true,
        }).then(projects => {                    
                callback(null,projects.length);
            }).catch(function (err) {
                callback(err);
            });                
        },
        (callback) => {
            models.commodities.findAll({ where: where,
                attributes :['id','name'],
                order: [
                    orderBy
                ],
                include:[
                    {
                        model:models.users,
                        attributes: [ [Sequelize.literal ('concat(`user`.`first_name`," ",`user`.`last_name`)'), 'Name']]
                    }
                ],
                raw:true,
                limit:pData.length, offset:pData.start})
            .then(commodities => {
                callback(null,commodities);
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
