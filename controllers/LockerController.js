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


// var storage = multer.diskStorage({
//     destination: function(req,file,callback){
//         callback(null,'uploads/locker_files');
//     },
//     filename: function(req,file,callback){       
//         callback(null,md5(Date.now())+'-'+file.originalname);        
//     }
// });

var upload = multer({ storage : utils.assestDest('locker_files') }).single('file');

exports.CreateLocker = function(request, response){
    let postData = request.body;   
    /*models.lockers.findOne({ where: {title: postData.title} }).then(title => {
        let result = {};
        if(title){
            result.success = false;
            result.message = 'title already existed.';
            response.json(result);
        }
        else{*/
            let result = {};
            getTypeId(postData.typeId,typeId=>{
                if(!typeId){
                    noResults(result,response);
                }
                else{                    
                    postData.typeId = typeId.id;                    
                    models.lockers.create(postData).then(lockers => {
                        if(lockers){
                            if(postData.files.length){
                                let filesData = [];                              
                                for(let file in postData.files){
                                    var orgname = postData.files[file].split('-');
                                    var mimetype = postData.files[file].split('.');
            
                                    filesData[file] = {'lockerId':lockers.id,'path':postData.files[file],'orgName':orgname[1],'mime_type':mimetype[mimetype.length-1]};
                                }
                             postData.lockerId = lockers.id;
                           
                            models.locker_files.bulkCreate(filesData).then(function(test) {
                                result.success = true;
                                result.message = 'Lockers successfully created'; 
                                return response.json(result);         
                            }).catch(function(err){
                                result.success = false;
                                result.message = err.message; 
                               return response.json(result);
                            });
                          }  
                          else{
                            result.success = true;
                            result.message = 'Lockers successfully created'; 
                            return response.json(result); 
                          }                        
                
                        }
                        else{                            
                            noResults(result,response)
                        }                        
                    });
                }                              
             });              
    //     }       
    // }); 
};

getTypeId = (typeId,cb) => {
    models.locker_types
        .findOne({
            where: {
                type: typeId,
                is_active: 1
            } 
        }).then(typeId => {
            cb(typeId);
        })
}


createLockerFiles = (postData,cb) => {
    models.locker_files.create(postData).then(lockerFiles => {
        cb(lockerFiles);
    });
}

noResults = (result,response) => {
    result.success = 'failure';
    result.message = 'Something went wrong';
    response.json(result);
}

//Get lockers values with database update 
exports.GetLockers = (req, res) => {
    models.lockers.hasMany(models.locker_files);
    models.lockers.findOne({ where: {id: req.params.id},
        include:[{model: models.locker_files, required: false}]
    }).then(lockers => {
        let response = {};       
        if (lockers) {
            response.success = true;
            response.data = lockers; 
            console          
        }
        else {
            response.success = false;
            response.message = 'No lockers found';
        }
        res.json(response);
    });
}

exports.Upload = function (request,response){   
    upload(request, response, function(err){         
        let json_data = {};
        json_data.success = false;
        if(request.file){
            json_data['success'] =  true;
            json_data['data'] =  'locker_files/'+request.file.filename; 
            json_data['mimetype'] =  request.file.mimetype; 
            json_data['name'] =  request.file.originalname;        
        }
        else{
            json_data.message = err.message;            
        }
        response.json(json_data);        
    });  
}

exports.FilterLockers = (req, res)=>{
    filterLockers(req, res,(records)=>{
            return res.json(records);
        });
}

exports.RemoveFile = (req, res)=>{
    result = {};
    if(req.headers['file'] != undefined){
        fs.unlink('uploads/'+req.headers['file'],(err)=>{
            if(!err)
            {
                result.success = true;
                result.message = 'Deleted Successfully';                
            }
            else{
                result.success = false;
                result.message = err.message;
            }   
            return res.json(result);

        });     
    }
    else{
        result.success = false;
        result.message = 'Problem with your request';
        return res.json(result);
    }
}

exports.fetchCounts = (req, res) => {
    models.lockers.count({
        where: { id: req.params.id }
    }).then(count => {
        let response = {};        
        response.success = true;
        response.data = {
            'count': count
        };        
        res.json(response);
    });
}

// filterLockers = (req, res ,cb)=>{
//     pData = req.body;
//     where = sort = {};
//     if(pData.columns.length){       
//         (pData.columns).forEach(col => {           
//             if((col.search.value).length){
//                 let cond = {};
//                 cond[col.data] = col.search.value;
//                 Object.assign(where,cond);
//             }          
//         });
//         if((pData.search.value).length){
//             let likeCond = [];
//             (pData.columns).forEach(col => {
//                 let item = {
//                         [col.data] : {
//                             [Op.like] : `%${pData.search.value}%`
//                         }
//                     }   
//                 likeCond.push(item);
//             });
//            // where = {[Op.or] : likeCond};
//            Object.assign(where,{[Op.or] : likeCond});
//         }      
//     }
   
//     let orderBy = [pData.order[0].column , pData.order[0].dir];

//     async.parallel([
//         (callback) => {
//             models.lockers.findAll({where: where,attributes:['id']}).then(projects => {                    
//                 callback(null,projects.length);
//             }).catch(function (err) {
//                 callback(err);
//             });                
//         },
//         (callback) => {
//             models.lockers.findAll({ where: where,
//                 order: [
//                     orderBy
//                 ],
//                 limit:pData.length, offset:pData.start})
//             .then(lockers => {
//                 callback(null,lockers);
//             })
//             .catch(function (err) {
//                 callback(err);
//             });                        
//         }
//     ],(err,results) => {
//             let json_res = {};
//             json_res['draw'] = pData.draw;
//         if(err){            
//             json_res['success'] = false;
//             json_res['recordsTotal'] = 0;
//             json_res['recordsFiltered'] = 0;
//             json_res['message'] = err;    
//             json_res['data'] = [];              
//         }
//         else{
//             json_res['success'] = true;
//             json_res['recordsTotal'] = results[0];
//             json_res['recordsFiltered'] = results[0];
//             json_res['data'] = results[1];
//         }                   
//         cb(json_res);
//     })
// };
filterLockers = (req, res ,cb)=>{
    pData = req.body;
     where = sort = {};
                if (pData.columns.length) {
            
                    (pData.columns).forEach(col => {
                        
                        if (String(col.search.value).length) {
                            let cond = {};
                            cond[col.data] = col.search.value;
                            Object.assign(where, cond);                
                        }
                    });
                    
                    if ((pData.search.value).length) {
                        let likeCond = [];
                        (pData.columns).forEach(col => {
                            let item = {
                                [col.data]: {
                                    [Op.like]: `%${pData.search.value}%`
                                }
                            }
                            likeCond.push(item);
                        });
                        // where = {[Op.or] : likeCond};
                        Object.assign(where, { [Op.or]: likeCond });
                    }
                }            
                let orderBy = [pData.order[0].column, pData.order[0].dir];        
  
        async.parallel([
            (callback) => {
                models.lockers.findAll({where: where,attributes:['id']}).then(projects => {                    
                    callback(null,projects.length);
                }).catch(function (err) {
                    callback(err);
                });                
            },
            (callback) => {
                models.lockers.hasMany(models.locker_files);
                models.lockers.findAll({ where: where,
                    include:[{
                        model:models.locker_files
                    }

                    ],
                    order: [
                        orderBy
                    ],
                    limit:pData.length, offset:pData.start})
                .then(lockers => {
                    callback(null,lockers);
                })
                .catch(function (err) {
                    callback(err);
                });                        
            }
        ], (err, results) => {
                    let json_res = {};
                    json_res['draw'] = pData.draw;
                    if (err) {
                        json_res['success'] = false;
                        json_res['recordsTotal'] = 0;
                        json_res['recordsFiltered'] = 0;
                        json_res['message'] = err;
                        json_res['data'] = [];
                    }
                    else {
                        json_res['success'] = true;
                        json_res['recordsTotal'] = results[0];
                        json_res['recordsFiltered'] = results[0];
                        json_res['data'] = results[1];
                    }
                    cb(json_res);
        })
    };

exports.LockerTypes = (req,res)=>{
    models.locker_types.findAll({where:{'is_active':true}}).then(data=>{
        let result = {};
        result.success  =true;
        result.data = [];
        if(data){
            result.data = data;
        }
        res.json(result);
    })
}
