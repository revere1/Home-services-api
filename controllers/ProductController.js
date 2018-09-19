var models = require('../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var jwt = require('jsonwebtoken');
var config = require('./../config/config.json')['system'];
var utils = require('./../helpers/utils');
var db = require('../models/index');
var async = require('async');
var multer = require('multer'); 
var fs = require('fs');


function getFileSize(file)
{
    var stats = fs.statSync(file);
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes / 1000000.0;
}
//Get all products Method:GET
exports.Products = function (request, response) {
    let $where = {}, not_consider = ['token', 'pageIndex', 'pageSize', 'sortField', 'sortOrder'];
    Object.keys(request.body).forEach(function (item) {
        if (!inArray(item, not_consider) && (request.body[item] != '' && request.body[item] != null && request.body[item] != undefined)) {
            $where[item] = { $like: '%' + request.body[item] + '%' }
        }
    }, this);
    let condition = { where: $where };
    condition['order'] = (request.body.sortField != undefined) ? [[request.body.sortField, request.body.sortOrder]] : [['createdAt', 'Desc']];
    if (request.body.pageSize) {
        var limit = parseInt(request.body.pageSize);
        condition['limit'] = limit + 1;
        var offset = (request.body.pageIndex) ? (limit * parseInt(request.body.pageIndex)) - limit : 0;
        condition['offset'] = offset;
    }
    let json_res = {};
    async.parallel(
        [
            (callback) => {
                Product.findAll(condition).then(projects => {
                    if ((projects.length === limit + 1)) {
                        json_res.itemsCount = offset + limit + 1;
                        projects.splice(-1, 1);
                    }
                    else {
                        json_res.itemsCount = offset + 1;
                    }
                    json_res.data = projects;
                    callback(null);
                });
            }
        ],
        (err, results) => {
            if (err) {
                json_res['status'] = 'failure';
                json_res['itemsCount'] = 0;
                json_res['data'] = {};
            }
            else {
                json_res['status'] = 'success';
            }
            response.json(json_res);
        }
    )
}

exports.DeleteProduct = function (request, response) {
    let id = request.params.id;
    let result = {};
    if (request.params.id != undefined) {
        models.products.destroy({ where: { 'id': id } }).then((rowDeleted) => {
            result.success = true;
            result.message = (rowDeleted === 1) ? 'Product deleted successfully' : 'Unable to delete Product';
            response.json(result);
        }, (err) => {
            result.success = false;
            result.message = 'Something went wrong';
            response.json(result);
        })
    }
    else {
        result.success = false;
        result.message = 'Not selected any Product';
        response.json(result);
    }
};
var upload = multer({ storage : utils.assestDest('product_images') }).single('file');


exports.CreateProduct = function (request, response) {
    let postData = request.body;
    //return response.json(postData);
    console.log(postData)
    let result = {};
    models.products.create(postData).then(products => {
        let result = {};
        if (products) {
            if (postData.files.length) {
                let filesData = [];
                for (let file in postData.files) {
                    filesData[file] = { 'productId': products.id, 'path': postData.files[file] };
                }
                for (let file in postData.files) {
                    var orgname = postData.files[file].split('-');
                    var mimetype = postData.files[file].split('.');

                    filesData[file] = { 'productId': products.id, 'path': postData.files[file], 'orgName': orgname[1], 'mime_type': mimetype[mimetype.length - 1] };
                }
                models.product_images.bulkCreate(filesData).then(function (test) {
                    console.log(postData)
                    result.success = true;
                    result.message = 'Product successfully created';
                    return response.json(result);
                }).catch(function (err) {
                    result.success = false;
                    result.message = err.message;
                    return response.json(result);
                });
            }
            else {
                result.success = true;
                result.message = 'Products successfully created';
                return response.json(result);
            }

        }
        else {
            noResults(result, response)
        }


    });

};

noResults = (result, response) => {
    result.success = 'failure';
    result.message = 'Something went wrong';
    response.json(result);
}

createProductsFiles = (postData, cb) => {
    console.log(postData)
    models.product_images.create(postData).then(product_images => {
        cb(product_images);
    });
}

createInsightFiles = (postData, cb) => {
    console.log(postData)
    models.product_images.create(postData).then(product_images => {
        cb(product_images);
    });
}
exports.GetProduct = (req, res) => {
    models.products.hasMany(models.product_images);
    models.products.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: models.product_images,
                attributes: ['id', 'path', 'orgName'],
                required: false
            },
        ],
        // limit: 3
    }).then(products => {
        let response = {};
        if (products) {
            products.product_images.forEach(function(attachment,index) {
                if(attachment.path != undefined){
                    try {
                        var stats = fs.statSync('uploads/'+attachment.path);
                        var fileSizeInBytes = stats["size"]
                        var size_mb = (fileSizeInBytes / 1000000).toFixed(2);                
                        products.product_images[index].setDataValue('fsize', size_mb); 
                      }
                      catch(err) {
                        products.product_images[index].setDataValue('fsize', 0);
                      }
                
                }else{
                    products.product_images[index].setDataValue('fsize', 0); 
                }               
            });
            response.success = true;
            response.data = products;
            console.log(response.data)
        }
        else {
            response.success = false;
            response.message = 'No Products found';
        }
        res.json(response);
    });
}

exports.Products = function (req, res, next) {
    if (utils.objLen(req.query)) Object.assign(where, req.query);
    models.products.findAll({
        attributes: ['id', 'product_name'],
        where: where
    }).then(function (products) {
        if (!products) {
            res.status(201).json({ success: false, message: 'Products Not Found.' });
        } else if (products) {
            res.status(201).json({
                success: true,
                data: products
            });
        }
    });
}


var upload = multer({ storage: utils.assestDest('product_images') }).single('file');
exports.Upload = function (request,response){   
    upload(request, response, function(err){         
        let json_data = {};
        json_data.success = false;
        if(request.file){
            json_data['success'] =  true;
            json_data['data'] =  'product_images/'+request.file.filename; 
            json_data['mimetype'] =  request.file.mimetype; 
            json_data['name'] =  request.file.originalname;        
        }
        else{
            json_data.message = err.message;            
        }
        response.json(json_data);        
    });  
}




exports.FilterProducts = (req, res) => {
    filterProducts(req, res, (records) => {
        return res.json(records);
    });
}


filterProducts = (req, res, cb) => {
    models.products = models.products;
    models.products.belongsTo(models.category,{foreignKey: 'category_id' });
    models.products.belongsTo(models.subcategory,{foreignKey: 'subcategory_id' });
  
    pData = req.body;
    where = sort = {};
    if (pData.columns.length) {
        (pData.columns).forEach(col => {
            if ((col.search.value).length) {
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
            likeCond.push(Sequelize.where(Sequelize.col(`category.category_name`), {
                //like: '%' + pData.search.value + '%'
            }));
            likeCond.push(Sequelize.where(Sequelize.col(`subcategory.subcategory_name`), {
                //like: '%' + pData.search.value + '%'
            }));
            where = { [Op.or]: likeCond };
        }
    }
    let orderBy = [pData.columns[pData.order[0].column].data, pData.order[0].dir];

    let options = {
        where: where,
        attributes: ['id', 'product_name','product_code','product_description','product_img','cost','delivery_days', 'quantity','status'],
        include: [
            {
                model: models.category,
                attributes: ['category_name'],
                //required:false
            },
            {
                model: models.subcategory,
                attributes: ['subcategory_name'],
                //required:false
            }
           
        ],
        raw: true
    };
    async.parallel([
        (callback) => {
            models.products.findAll(options).then(projects => {
                callback(null, projects.length);
            }).catch(function (err) {
                callback(err);
            });
        },
        
        (callback) => {
            models.products.hasMany(models.product_images);
            models.products.findAll({ where: where,
                include:[{
                    model:models.product_images
                }

                ],
                order: [
                    orderBy
                ],
                limit:pData.length, offset:pData.start})
            .then(products => {
                callback(null,products);
            })
            .catch(function (err) {
                callback(err);
            });                        
        },
        (callback) => {
            Object.assign(options, { order: [orderBy], limit: pData.length, offset: pData.start });
            models.products.findAll(options).then(products => {
                    callback(null, products);
                    console.log(products)
                }).catch(function (err) {
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
            json_res['recordsTotal'] = results[0];
            json_res['recordsFiltered'] = results[0];
            json_res['data'] = results[1];
        }
        cb(json_res);
    })
}

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Only image files are allowed!'));
        }
        callback(null, 'uploads/product_images');
    },
    filename: function (req, file, callback) {
        callback(null, md5((Date.now()) + file.originalname) + req.app.locals.path.extname(file.originalname));
    }
});
var insImgUpload = multer({ storage: utils.assestDest('product_img') }).single('product_img');

exports.UpdateProduct = function (request, response) {
    insImgUpload(request, response, function (err) {
    //return response.json(request.body);
    let postData = request.body;
    models.products.findOne({ where: { id: request.params.id }, required: false }).then(products => {
        let result = {};
        if (products) {
            if (request.file !== undefined){
                if(products.product_img){
                    file = products.product_img;
                    if(fs.existsSync('uploads/'+file)){
                        fs.unlinkSync('uploads/' + file)
                    }
                }
                postData.product_img = 'product_img/' + request.file.filename;
            }
            console.log(postData)
            //trimPostData = utils.DeepTrim(postData)
            products.updateAttributes(postData).then((updateProducts) => {
                let filesData = [];
                console.log(postData)
                postData.files = (postData.files !== undefined && (postData.files).length) ? (postData.files).split(',') : [];
                for (let file in postData.files) {
                    var orgname = postData.files[file].split('-');
                    var mimetype = postData.files[file].split('.');
                    filesData[file] = { 'productId': products.id, 'path': postData.files[file], 'orgName': orgname[1], 'mime_type': mimetype[mimetype.length - 1] };
                }
                postData.productId = products.id;
                models.product_images.bulkCreate(filesData).then(function (test) {
                    if (updateProducts) {
                        result.success = true;
                        result.message = 'Product Updated  successfully ';
                    } else {
                        result.success = true;
                        result.message = 'Product not Updated successfully ';
                    }
                    response.json(result);
                }).catch(function (err) {
                    result.success = false;
                    result.message = err.message;
                    return response.json(result);
                });
            })
        }
        else {
            result.success = false;
            result.message = 'Product not existed.';
            response.json(result);
        }
    });
});
};
// exports.UpdateProduct = function (request, response) {
//     insImgUpload(request, response, function (err) {
//     //return response.json(request.body);
//     let postData = request.body;
//     console.log(postData)
//     models.products.findOne({ where: { id: request.params.id }, required: false }).then(products => {
//         let result = {};
//         if (products) {
//             if (request.file !== undefined){
//                 if(products.product_img){
//                     file = products.product_img;
//                     fs.unlinkSync('uploads/' + file)
//                 }
//                 postData.product_img = 'product_images/' + request.file.filename;
//             }
//             //console.log(postData)
//             //trimPostData = utils.DeepTrim(postData)
//             products.updateAttributes(postData).then((updateProducts) => {
//                 let filesData = [];
//                 postData.files = postData.files.length;
//                 console.log(postData.files)
//                 for (let file in postData.files) {
//                     // var orgname = postData.files[file];
//                     // var mimetype = postData.files[file];
//                     filesData[file] = { 'productId':id, 'path': postData.files[file]};
//                 }
//                 postData.productId = products.id;
//                 models.product_images.bulkCreate(filesData).then(function (test) {
//                     if (updateProducts) {
//                         result.success = true;
//                         result.message = 'Product Updated  successfully ';
//                     } else {
//                         result.success = true;
//                         result.message = 'Product not Updated successfully ';
//                     }
//                     response.json(result);
//                 }).catch(function (err) {
//                     result.success = false;
//                     result.message = err.message;
//                     return response.json(result);
//                 });
//             })
//         }
//         else {
//             result.success = false;
//             result.message = 'Product not existed.';
//             response.json(result);
//         }
//     });
// });
// };
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
        result.message = 'Product with your request';
        return res.json(result);
    }
}
exports.DeleteProductsAttachements = function (request, res) {
    models.product_images.findAll({
        where: { 'id': request.params.id },
        attributes: ['path']
    }).then(attachment => {
        let response = {};
        let files = [];
        if (attachment) {
            response.success = true;
            files = attachment.map(file => file.path);
            response.data = files;
        }
        let result = {};
        if (request.params.id != undefined) {
            models.product_images.destroy({ where: { 'id': request.params.id } }).then((rowDeleted) => {
                files.map(file => fs.unlinkSync('uploads/' + file));
                result.success = true;
                result.message = (rowDeleted === 1) ? 'product Images deleted successfully' : 'Unable to delete product Images';
                res.json(result);
            }, (err) => {
                result.success = false;
                result.message = 'Something went wrong';
                res.json(result);
            })
        }
        else {
            result.success = false;
            result.message = 'Not selected any user';
            res.json(result);
        }
    });
};

var Iuploads = multer({ storage: utils.assestDest('summary-note-images') }).array('userphoto');
exports.UploadImage = function (request, response) {
    Iuploads(request, response, function (err) {
        let json_data = {};
        json_data.success = false;
        if (request.files) {
            json_data['data'] = [];
            (request.files).forEach(file => {
                json_data['data'].push('summary-note-images/' + file.filename);
            })
            json_data['success'] = true;
            //json_data['data'] = 'summary-note-images/' + request.file.filename;
            //json_data['mimetype'] = request.files.mimetype;
            //json_data['name'] = request.file.originalname;
        }
        else {
            json_data.message = err.message;
        }
        response.json(json_data);
    });
}

exports.getAllActiveProducts = function(req,res){
    models.products.findAll({
        where:{
            status:'active'
        },
        attributes:['id',['product_name','bname']]
    }).then(function(products){
        if(products){
            res.json({success:true,products:products})
        }else{
            res.json({
                success:false,
                message:'Something went wrong.Try again'
            });
        }
    });
}