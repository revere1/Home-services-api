var models = require('../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var jwt = require('jsonwebtoken');
var config = require('./../config/config.json')['system'];
var utils = require('./../helpers/utils');
var multer = require('multer')
var async = require('async');
var md5 = require('md5');
var fs = require('fs');
//var app   = require('../app');


//Get all companies Method:GET
exports.Companies = function (request, response) {
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
            // (callback) => {
            //      User.findAll({where: $where}).then(projects => {
            //         json_res.itemsCount =  projects.length;      
            //         callback(null);
            //     });                
            // },
            (callback) => {
                Ticker.findAll(condition).then(projects => {
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


exports.DeleteCompany = function (request, response) {
    let id = request.params.id;
    let result = {};
    if (request.params.id != undefined) {
        models.company_details.destroy({ where: { 'id': id },individualHooks: true }).then((rowDeleted) => {
            result.success = true;
            result.message = (rowDeleted === 1) ? 'Company deleted successfully' : 'Unable to delete Company';
            response.json(result);
        }, (err) => {
            result.success = false;
            result.message = 'Something went wrong';
            response.json(result);
        })
    }
    else {
        result.success = false;
        result.message = 'Not selected any Company';
        response.json(result);
    }
};

exports.CreateCompany = function (request, response) {
    upload(request, response, function (err) {
        let postData = request.body;
        models.company_details.findOne({ where: { name: postData.name } }).then(company => {
            let result = {};
            if (company) {
                result.success = false;
                result.message = 'Company already existed.';
                response.json(result);
            }
            else {
                postData = request.body;
                if (request.file !== undefined)
                    postData.logo = 'analyst_comp_logo/' + request.file.filename
                trimPostData = utils.DeepTrim(postData);
                models.company_details.create(trimPostData).then(company => {
                    if (company) {
                        result.success = true;
                        result.message = 'Company successfully created';
                    }
                    else {
                        result.success = true;
                        result.message = 'Company Not  successfully created';
                    }
                    response.json(result);
                });
            }
        });
    });
};

noResults = (result, response) => {
    result.success = 'failure';
    result.message = 'Something went wrong';
    response.json(result);
}

exports.GetCompanyByname = (req, res) => {
    models.company_details.findOne({
        where: { name: req.params.name },
    }).then(company => {
        let response = {};
        if (company) {
            response.success = true;
            response.data = {
                'name': company.name,
                'website': company.website,               
                'about': company.about,             
                'id': company.id,
                'company_logo':company.logo
            };
        }
        else {
            response.success = false;
            response.message = 'No  found';
        }
        res.json(response);
    });
}
exports.GetCompany = (req, res) => {
    models.company_details.findOne({
        where: { id: req.params.id },
    }).then(company => {
        let response = {};
        if (company) {
            response.success = true;
            response.data = {
                'name': company.name,
                'website': company.website,               
                'about': company.about,             
                'id': company.id,
                'company_logo':company.logo
            };
        }
        else {
            response.success = false;
            response.message = 'No  found';
        }
        res.json(response);
    });
}

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Only image files are allowed!'));
        }
        callback(null, 'uploads/analyst_comp_logo');
    },
    filename: function (req, file, callback) {

        callback(null, md5((Date.now()) + file.originalname) + req.app.locals.path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage }).single('logo');
exports.UploadImage = function (request, response) {
    upload(request, response, function (err) {
        let json_data = {};
        var logo = 'analyst_comp_logo/' + request.file.filename
        json_data.success = false;
        if (request.file) {
            json_data['data'] = ['analyst_comp_logo/' + request.file.filename];
            json_data['success'] = true;
        }
        else {
            json_data.message = err.message;
        }
        response.json(json_data);
    });
}


exports.Companies = function (req, res, next) { 
    let where = {};  
    if (utils.objLen(req.query)) Object.assign(where, req.query);
    // find sectors
    models.company_details.findAll({
        attributes: ['id', 'name'],
        where: where
    }).then(function (company_details) {
        if (!company_details) {
            res.status(201).json({ success: false, message: 'company_details Not Found.' });
        } else if (company_details) {
            res.status(201).json({
                success: true,
                data: company_details
            });
        }
    });
}
exports.FilterCompanies = (req, res) => {
    filterCompanies(req, res, (records) => {
        return res.json(records);
    });
}

filterCompanies = (req, res, cb) => {
    models.company_details = models.company_details; 
    models.company_details.belongsTo(models.users, { foreignKey: 'createdBy' });
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
            likeCond.push(Sequelize.where(Sequelize.fn('concat', Sequelize.col(`user.first_name`), ' ', Sequelize.col(`user.last_name`)), {
                like: '%' + pData.search.value + '%'
            }));
            // likeCond.push(Sequelize.where(Sequelize.col(`country.name`), {
            //     like: '%' + pData.search.value + '%'
            // }));
            // likeCond.push(Sequelize.where(Sequelize.col(`sector.name`), {
            //     like: '%' + pData.search.value + '%'
            // }));
            where = { [Op.or]: likeCond };
        }
    }
    let orderBy = [pData.columns[pData.order[0].column].data, pData.order[0].dir];

    let options = {
        where: where,
        attributes: ['id', 'name', 'website', 'about', 'logo'],
        include: [
          
            {
                model: models.users,
                attributes: [[Sequelize.literal('concat(`user`.`first_name`," ",`user`.`last_name`)'), 'Name']]
            },
        ],
        raw: true
    };
    async.parallel([
        (callback) => {
            models.company_details.findAll(options).then(projects => {
                callback(null, projects.length);
            }).catch(function (err) {
                callback(err);
            });
        },
        (callback) => {
            Object.assign(options, { order: [orderBy], limit: pData.length, offset: pData.start });
            models.company_details.findAll(options).then(company_details => {
                callback(null, company_details);
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

exports.AutoSearchCompanies = function (request, response) {
    let term = request.query.p;
    models.company_details.findOne({
        where: {
            name: {
                $like: '%' + term + '%'
            }
        },
        attributes: ['id', ['name', 'sku']],
        required: false
    }).then(company_details => {
        $result = [];
        if (company_details) $result.push(company_details);
        response.json($result);
    }).catch(function (err) {
        response.json([]);
    });
};

exports.UpdateCompany = function (request, response) {
    upload(request, response, function (err) {
        let postData = request.body;
        models.company_details.findOne({ where: { id: postData.id }, required: false }).then(company_details => {
            let result = {};
            if (company_details) {
                postData = request.body;
                if (request.file !== undefined){
                    if(company_details.logo){
                        files = company_details.logo;
                        fs.unlinkSync('uploads/' + files)
                    }
                    postData.logo = 'analyst_comp_logo/' + request.file.filename;
                }
                trimPostData = utils.DeepTrim(postData)
                company_details.updateAttributes(trimPostData).then(updateCompanies => {
                    if (updateCompanies) {
                        result.success = true;
                        result.message = 'Company Updated successfully ';
                    } else {
                        result.success = true;
                        result.message = 'Company not Updated successfully ';
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
                result.message = 'Company not existed.';
                response.json(result);
            }
        });
    })
};