var models    = require('../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var jwt    = require('jsonwebtoken'); 
var config    = require('./../config/config.json')['system'];
var utils    = require('./../helpers/utils');
var crypto = require('crypto');
var multer = require('multer'); 
var async = require('async');
var md5  = require('md5');
var fs = require('fs');



var upload = multer({ storage : utils.assestDest('banner_images') }).single('file');
exports.uploadBanner = function(req,res)
{
    upload(req, res, function(err)
    { 
        let json_data = {};
        if(req.file){
            json_data['success'] =  true;
            json_data['data'] =  'banner_images/'+req.file.filename; 
            json_data['mimetype'] =  req.file.mimetype; 
            json_data['name'] =  req.file.originalname;      
        }else{
            json_data.message = err.message;            
        }
        res.json(json_data); 
    });
}
exports.addBanner = function(req,res){
    let postData = req.body;
    console.log(req);
 models.banners.create(postData).then(banner=>{
     if(banner){
         res.json({success:true,message:'Banner added successfully'});
     }else{
         res.json({success:false,message:'Adding banner failed.Please try again'});
     }

 });
}
exports.getBanners = function(req,res){

    models.banners.belongsTo(models.category,{ foreignKey: 'btype_id' });
    models.banners.belongsTo(models.products,{ foreignKey: 'btype_id' });

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
    let options = {
        where: where,
        attributes: ['id', 'banner','btype','btype_id', 'status'],
        include: [
            {
                model: models.category,               
                attributes: ['category_name'],
                where:{'$banners.btype$':1}
            },
            {
                model: models.products,
                attributes: ['product_name'],
                where:Sequelize.and({'$banners.btype$':2}),
                required:false
            }
        ],
        //raw: true
    };
    async.parallel([
        (callback) => {
            models.banners.findAll(options).then(projects => {                    
                callback(null,projects.length);
            }).catch(function (err) {
                callback(err);
            });                
        },
        (callback) => {
            models.banners.findAll({ where: where,
                order: [
                    orderBy
                ],
                limit:pData.length, offset:pData.start})
            .then(banners => {
                callback(null,banners);
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
        res.json(json_res);
    })
}