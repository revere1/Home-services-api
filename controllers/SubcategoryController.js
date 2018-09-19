var models    = require('../models');
var jwt    = require('jsonwebtoken');
var Sequelize = require('sequelize');
var config    = require('./../config/config.json')['system'];
var utils    = require('./../helpers/utils.js');
const Op = Sequelize.Op;
var async = require('async');
var multer = require('multer'); 
//var app   = require('../app');

var upload = multer({ storage : utils.assestDest('subcategory_images') }).single('file');

exports.Subcategory = function(req, res, next){ 
    let where = {};
    where['status'] = 'active';
    if(utils.objLen(req.params))Object.assign(where,req.params);
    if(utils.objLen(req.query))Object.assign(where,req.query);    
    // find subsector
    models.subcategory.findAll({
        attributes: ['id', 'subcategory_name'],
        where: where
    }).then(function(subcategories) {
        if (!subcategories) {
			res.status(201).json({ success: false, message: 'Subcategories Not Found.' });
		}else if (subcategories) {          
            res.status(201).json({
                success: true,
                data: subcategories
            });		
		}
	});
}

exports.CreateSubCategory = function (request, response) {
    let postData =utils.DeepTrim(request.body);
    console.log(request.body)
    models.subcategory.findOne({ where: { subcategory_name: postData.subcategory_name, category_id: postData.category_id }, required: false }).then(subcategories => {
        let result = {};
        if (subcategories) {
            result.success = false;
            result.message = 'SubCategory already existed.';
            response.json(result);
        } else {
            models.subcategory.create(postData).then(subcategories => {
                if (subcategories) {
                    result.success = true;
                    result.message = 'SubCategory Successfully created';
                }
                else {
                    result.success = true;
                    result.message = 'SubCategory Not Successfully created';
                }
                response.json(result);
            });
        }

    });
};
//Get State based on Id
exports.GetSubcategory = (req, res) => {
    // models.countries.hasOne(models.user_profile);
    models.subcategory.findOne({
        where: { id: req.params.id }
    }).then(subcategories => {
        let response = {};
        if (subcategories) {
            response.success = true;
            response.data = {
                'subcategory_name': subcategories.subcategory_name,
                'subcategory_desc': subcategories.subcategory_desc,
                'path': subcategories.path,
                'status': subcategories.status,
                'category_id':subcategories.category_id,
                'id': subcategories.id
            };
        }
        else {
            response.success = false;
            response.message = 'No State found';
        }
        res.json(response);
    });
}

exports.UpdateSubCategory = function (request, response) {
    let postData = utils.DeepTrim(request.body);
    models.subcategory.findOne({ where: { id: postData.id }, required: false }).then(subcategories => {
        let result = {};
        if (subcategories) {
            subcategories.updateAttributes(postData).then((updateSubCategory) => {
                if (updateSubCategory) {
                    result.success = true;
                    result.message = 'SubCategory Updated successfully ';
                } else {
                    result.success = true;
                    result.message = 'SubCategory Not Updated successfully ';
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
            result.message = 'SubCategory not existed.';
            response.json(result);
        }
    });
};
exports.FilterSubCategories = (req, res)=>{
    filterSubCategory(req, res,(records)=>{
            return res.json(records);
        });
}
exports.Upload = function (request,response){   
    upload(request, response, function(err){         
        let json_data = {};
        json_data.success = false;
        if(request.file){
            json_data['success'] =  true;
            json_data['data'] =  'subcategory_images/'+request.file.filename; 
            json_data['mimetype'] =  request.file.mimetype; 
            json_data['name'] =  request.file.originalname;        
        }
        else{
            json_data.message = err.message;            
        }
        response.json(json_data);        
    });  
}
filterSubCategory = (req, res ,cb)=>{
    models.subcategory = models.subcategory;
    models.subcategory.belongsTo(models.category,{ foreignKey: 'category_id' });
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
            likeCond.push(Sequelize.where(Sequelize.col(`category.category_name`), {
                like: '%' + pData.search.value + '%'
            }));
            where = {[Op.or] : likeCond};
        }      
    }
   
    let orderBy = [pData.columns[pData.order[0].column].data , pData.order[0].dir];
    let options = {
        where: where,
        attributes: ['id', 'subcategory_name', 'subcategory_desc','path','status','createdAt'],
        include: [
            {
                model: models.category,
                attributes: ['category_name']
            },
        ],
        raw: true
    };
    async.parallel([
        (callback) => {
            models.subcategory.findAll(options).then(projects => {
                callback(null, projects.length);
            }).catch(function (err) {
                callback(err);
            });
        },
        (callback) => {
            Object.assign(options, { order: [orderBy], limit: pData.length, offset: pData.start });
            models.subcategory.findAll(options).then(products => {
                    callback(null, products);
                }).catch(function (err) {
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
// filterSubCategory = (req, res, cb) => {
//     models.subcategory = models.subcategory;
//     models.subcategory.belongsTo(models.category,{ foreignKey: 'category_id' });
//     pData = req.body;
//     where = sort = {};
//     if (pData.columns.length) {
//         (pData.columns).forEach(col => {
//             if ((col.search.value).length) {
//                 let cond = {};
//                 cond[col.data] = col.search.value;
//                 Object.assign(where, cond);
//             }
//         });
//         if ((pData.search.value).length) {
//             let likeCond = [];
//             (pData.columns).forEach(col => {
//                 let item = {
//                     [col.data]: {
//                         [Op.like]: `%${pData.search.value}%`
//                     }
//                 }
//                 likeCond.push(item);
//             });
//             likeCond.push(Sequelize.where(Sequelize.col(`category.category_name`), {
//                 like: '%' + pData.search.value + '%'
//             }));
//             where = { [Op.or]: likeCond };
//         }
//     }
//     let orderBy = [pData.columns[pData.order[0].column].data, pData.order[0].dir];

//     let options = {
//         where: where,
//         attributes: ['id', 'subcategory_name', 'subcategory_desc'],
//         include: [
//             {
//                 model: models.category,
//                 attributes: ['category_name']
//             },
//         ],
//         raw: true
//     };
//     async.parallel([
//         (callback) => {
//             models.subcategory.findAll(options).then(projects => {
//                 callback(null, projects.length);
//             }).catch(function (err) {
//                 callback(err);
//             });
//         },
//         (callback) => {
//             Object.assign(options, { order: [orderBy], limit: pData.length, offset: pData.start });
//             models.subcategory.findAll(options).then(products => {
//                     callback(null, products);
//                 }).catch(function (err) {
//                     callback(err);
//                 });
//         }
//     ], (err, results) => {
//         let json_res = {};
//         json_res['draw'] = pData.draw;
//         if (err) {
//             json_res['success'] = false;
//             json_res['recordsTotal'] = 0;
//             json_res['recordsFiltered'] = 0;
//             json_res['message'] = err;
//             json_res['data'] = [];
//         }
//         else {
//             json_res['recordsTotal'] = results[0];
//             json_res['recordsFiltered'] = results[0];
//             json_res['data'] = results[1];
//         }
//         cb(json_res);
//     })
// }
exports.SubCategories = function (req, res, next) {
    let where = {};
    where['status'] = 'active';
    if (utils.objLen(req.query)) Object.assign(where, req.query);
    // find categories
    models.subcategory.findAll({
        attributes: ['id', 'subcategory_name'],
        where: where
    }).then(function (categories) {
        if (!categories) {
            res.status(201).json({ success: false, message: 'Categories Not Found.' });
        } else if (categories) {
            res.status(201).json({
                success: true,
                data: categories
            });
        }
    });
}




exports.DeleteSubCategory = function(request, response){
    // let id = request.params.id;
    let result = {};
    if(request.params.id != undefined){
        models.subcategory.destroy({where: {id: request.params.id}}).then((rowDeleted)=>{
            result.success = true;
            result.message = (rowDeleted === 1) ? 'subcategory deleted successfully' : 'Unable to delete subcategory';
            response.json(result);
        }).catch(function(err){
            result.message = err,
            response.json(result);
        })
        // ,(err)=>{
        //     result.success = false;
        //     result.message = 'you must delete sector in this  ';
        //     response.json(result);
        // })
    }
    else{
        result.success = false;
        result.message = 'Not selected any subcategories';
        response.json(result);
    }   
};
