var models = require('../../models');
var Sequelize = require('sequelize');
var jwt = require('jsonwebtoken');
var config = require('./../../config/config.json')['system'];
var utils = require('./../../helpers/utils');
const Op = Sequelize.Op;
var db = require('../../models/index');
var async = require('async');
var multer = require('multer');
var md5 = require('md5');
var crypto = require('crypto');
var fs = require('fs');
var Twit = require('twit');
var tconfig = require('./../../config/twitterconfig')

function getFileSize(file)
{
    var stats = fs.statSync(file);
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes / 1000000.0;
}

exports.CreateInsight = (req, res) => {
    models.insights.create(req.body).then(insight => {
        let result = {};
        if (insight) {
            result.success = true;
            result.message = 'Insight successfully created';
            result.id = insight.id;
            res.json(result);
        }
        else {
            noResults(result, res)
        }
    });
}


noResults = (result, response) => {
    result.success = 'failure';
    result.message = 'Something went wrong';
    response.json(result);
}

createInsightFiles = (postData, cb) => {
    models.insight_attachements.create(postData).then(insight_attachements => {
        cb(insight_attachements);
    });
}
exports.FilterInsights = (req, res) => {

    filterInsights(req, res, (records) => {
        return res.json(records);
    });
}
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Only image files are allowed!'));
        }
        callback(null, 'uploads/insight_img');
    },
    filename: function (req, file, callback) {
        callback(null, md5((Date.now()) + file.originalname) + req.app.locals.path.extname(file.originalname));
    }
});
var insImgUpload = multer({ storage: utils.assestDest('insight_img') }).single('insight_img');
// exports.UpdateInsight = function (request, response) {
//     insImgUpload(request, response, function (err) {
//     //return response.json(request.body);
//     let postData = request.body;
//     models.insights.findOne({ where: { id: request.params.id }, required: false }).then(insights => {
//         let result = {};
//         if (insights) {
//             if (request.file !== undefined){
//                 if(insights.insight_img){
//                     file = insights.insight_img;
//                     fs.unlinkSync('uploads/' + file)
//                 }
//                 postData.insight_img = 'insight_img/' + request.file.filename;
//             }
//             console.log(postData)
//             //trimPostData = utils.DeepTrim(postData)
//             insights.updateAttributes(postData).then((updateInsights) => {
//                 let filesData = [];
//                 postData.files = (postData.files).length ? (postData.files).split(',') : [];
//                 for (let file in postData.files) {
//                     var orgname = postData.files[file].split('-');
//                     var mimetype = postData.files[file].split('.');
//                     filesData[file] = { 'insightId': insights.id, 'path': postData.files[file], 'orgName': orgname[1], 'mime_type': mimetype[mimetype.length - 1] };
//                 }
//                 postData.insightId = insights.id;
//                 models.insight_attachements.bulkCreate(filesData).then(function (test) {
//                     if (updateInsights) {
//                         result.success = true;
//                         result.message = 'Insight Updated  successfully ';
//                     } else {
//                         result.success = true;
//                         result.message = 'Insight not Updated successfully ';
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
//             result.message = 'Insight not existed.';
//             response.json(result);
//         }
//     });
// });
// };
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





// var storage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, 'uploads/insight_files');
//     },
//     filename: function (req, file, callback) {

//         callback(null, md5(Date.now()) + '-' + file.originalname);

//     }
// });

var upload = multer({ storage: utils.assestDest('insight_comment_files') }).single('file');
exports.Upload = function (request, response) {
    upload(request, response, function (err) {
        let json_data = {};
        json_data.success = false;
        if (request.file) {
            json_data['success'] = true;
            json_data['data'] = 'insight_comment_files/' + request.file.filename;
            json_data['mimetype'] = request.file.mimetype;
            json_data['name'] = request.file.originalname;
        }
        else {
            json_data.message = err.message;
        }
        response.json(json_data);
    });
}

exports.RemoveFile = (req, res) => {
    result = {};
    if (req.headers['file'] != undefined) {
        fs.unlink('uploads/' + req.headers['file'], (err) => {
            if (!err) {
                result.success = true;
                result.message = 'Deleted Successfully';
            }
            else {
                result.success = false;
                result.message = err.message;
            }
            return res.json(result);

        });
    }
    else {
        result.success = false;
        result.message = 'Problem with your request';
        return res.json(result);
    }
}
exports.GetInsights = (req, res) => {
    models.insights.belongsTo(models.tickers);
    models.insights.belongsTo(models.users, { foreignKey: 'createdBy' });
    models.insights.hasMany(models.insight_attachements);
    models.insights.belongsTo(models.sectors);
    models.insights.belongsTo(models.subsectors);
    models.insights.belongsTo(models.regions);
    models.insights.belongsTo(models.currency);
    models.insights.belongsTo(models.commodities);
    models.users.hasOne(models.user_profile);
    models.user_profile.belongsTo(models.company_details,{foreignKey : 'company_id'})
  
    models.insights.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: models.tickers,
                attributes: ['id', 'name', 'company', 'share_in_issue', 'listing_exchange', 'about'],
                required: false
            },
            {
                model: models.commodities,
                attributes: ['id', 'name'],
                required: false
            },
        
            {
                model: models.users,
                attributes: ['first_name', 'last_name'],
                include:[{
                model:models.user_profile,
                attributes:['id','company_name'],
                required:false,
                include:[{
                    model:models.company_details,
                    attributes:['id','logo'],
                    required:false
                }]
                }],
                required: false
            },
            {
                model: models.insight_attachements,
                attributes: ['id', 'path', 'orgName'],
                required: false
            },
            {
                model: models.sectors,
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: models.subsectors,
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: models.regions,
                attributes: ['id', 'name'],
                required: false
            },
            {
                model: models.currency,
                attributes: ['id', 'name'],
                required: false
            }
        ],
        // limit: 3
    }).then(insights => {
        let response = {};
        if (insights) {
            insights.insight_attachements.forEach(function(attachment,index) {
                if(attachment.path != undefined){
                    try {
                        var stats = fs.statSync('uploads/'+attachment.path);
                        var fileSizeInBytes = stats["size"]
                        var size_mb = (fileSizeInBytes / 1000000).toFixed(2);                
                        insights.insight_attachements[index].setDataValue('fsize', size_mb); 
                      }
                      catch(err) {
                        insights.insight_attachements[index].setDataValue('fsize', 0);
                      }
                
                }else{
                    insights.insight_attachements[index].setDataValue('fsize', 0); 
                }               
            });
            response.success = true;
            response.data = insights;
        }
        else {
            response.success = false;
            response.message = 'No Insights found';
        }
        res.json(response);
    });
}

exports.GetLatestInsights = (req, res) => {
    models.insights.belongsTo(models.users, { foreignKey: 'createdBy' });
    models.insights.hasOne(models.insights_views);
    models.insights.hasOne(models.insight_comments);
    models.insights.belongsTo(models.commodities);
    models.insights.belongsTo(models.tickers);
    models.insights.belongsTo(models.sectors);
    models.insights.belongsTo(models.currency);
    models.insights.belongsTo(models.regions);
    models.insights.findAll({
        where: {
            $and: [
                { 'createdBy': req.params.user },
                { 'status': 'published' }
            ]
        },
        include: [{
            model: models.users,
            attributes: ['first_name', 'last_name', 'email'],
            include: [{
                model: models.user_profile,
                attributes: ['profile_pic'],
            }]
        }],
        include: [{
            model: models.commodities,
            attributes: ['id', 'name'],
            required: false
        },
        {
            model: models.tickers,
            attributes: ['company', 'name', 'companyId'],
            required: false
        },
        {
            model: models.sectors,
            attributes: ['id', 'name'],
        },
        {
            model: models.currency,
            attributes: ['id', 'name'],
        },
        {
            model: models.regions,
            attributes: ['id', 'name'],
        },
        {
            model: models.insights_views,
            attributes: [[Sequelize.literal('(select count(`insight_id`) from insights_views  where insights.id = insights_views.insight_id)'), 'viewCount']]
        },
        {
            model: models.insight_comments,
            attributes: [
                [Sequelize.literal('(select count(`insightId`) from insight_comments  where insights.id = insight_comments.insightId)'), 'commentCount']
            ],
            required: false
        },
        ],

        order: [["createdAt", "desc"]],
        limit: 5
    }).then(insights => {
        let response = {};
        if (insights) {
            response.success = true;
            response.data = insights;
        }
        else {
            response.success = false;
            response.message = 'No Insights found';
        }
        res.json(response);
    });
}

filterInsights = (req, res, cb) => {
    pData = req.body;
    where = sort = {};
    // where = { 'access_level': userType };
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
            Object.assign(where, { [Op.or]: likeCond });
        }
    }
    let c = [];
    if (pData.currentUserId !== undefined && utils.objLen(pData.currentUserId)) {
        c.push(pData.currentUserId);
        //Object.assign(where, pData.currentUserId);
    }
    if (pData.userId) {
        Object.assign(where, { 'editorierId': pData.userId });
    }

    if (pData.where !== undefined && utils.objLen(pData.where)) {
        Object.assign(where, pData.where);
    }
    if (pData.tickerId) {
        c.push({ 'tickerId': { $in: pData.tickerId } });
        //Object.assign(where, { 'tickerId': pData.tickerId });
    }
    if (pData.currencyId) {
        c.push({ 'currencyId': { $in: pData.currencyId } });
        //Object.assign(where, { 'tickerId': pData.tickerId });
    }
    if (pData.regionId) {
        c.push({ 'regionId': { $in: pData.regionId } });
        //Object.assign(where, { 'tickerId': pData.tickerId });
    }
    if (pData.sectorId) {
        c.push({ 'sectorId': { $in: pData.sectorId } });
        //Object.assign(where, { 'tickerId': pData.tickerId });
    }
    if (pData.insightId) {
        c.push({ 'id': { $in: pData.insightId } });
        // Object.assign(where, { 'id': pData.insightId });
    }
    if (c.length)
        Object.assign(where, { $or: c });
    let orderBy = [pData.order[0].column, pData.order[0].dir];
    async.parallel([
        (callback) => {
            models.insights.hasOne(models.insights_views);
            models.insights.hasOne(models.insight_comments);
            models.insights.belongsTo(models.tickers);
            models.insights.belongsTo(models.users, { foreignKey: 'createdBy' });
            models.insights.belongsTo(models.sectors);
            models.insights.belongsTo(models.currency);
            models.insights.belongsTo(models.regions);
            models.insights.belongsTo(models.commodities);
            models.users.hasOne(models.user_profile);

            models.insights.findAll({
                where: where,
                include: [
                    {
                        model: models.insights_views,
                        attributes: [[Sequelize.literal('(select count(`insight_id`) from insights_views  where insights.id = insights_views.insight_id)'), 'viewCount']]
                    },
                    {
                        model: models.insight_comments,
                        attributes: [
                            //[Sequelize.fn('count',Sequelize.col('insightId')),'commentCount'],
                            [Sequelize.literal('(select count(`insightId`) from insight_comments  where insights.id = insight_comments.insightId)'), 'commentCount']
                        ],
                        where: { 'parent': null },
                        required: false
                    },
                    {
                        model: models.tickers,
                        attributes: ['company', 'name', 'companyId'],
                    },
                    {
                        model: models.commodities,
                        attributes: ['id', 'name'],
                    },
                    {
                        model: models.sectors,
                        attributes: ['id', 'name'],
                    },
                    {
                        model: models.currency,
                        attributes: ['id', 'name'],
                    },
                    {
                        model: models.regions,
                        attributes: ['id', 'name'],
                    },
                    {
                        model: models.users,
                        attributes: [[Sequelize.literal('concat(`user`.`first_name`," ",`user`.`last_name`)'), 'Name']],
                        include: [{
                            model: models.user_profile,
                            attributes: ['profile_pic', 'company_name']
                        }],
                    }
                ],
                order: [
                    orderBy
                ],
                group: ['id'],
                raw: true,
                limit: pData.length, offset: pData.start
            }).then(insights => {
                callback(null, insights);

            }).catch(function (err) {
                callback(err);
            });
        }
    ], (err, results) => {
        let json_res = {};
        json_res['draw'] = pData.draw;
        if (err) {
            json_res['success'] = false;
            // json_res['recordsTotal'] = 0;
            //  json_res['recordsFiltered'] = 0;
            json_res['message'] = err;
            json_res['data'] = [];

        }
        else {
            json_res['success'] = true;
            //  json_res['recordsTotal'] = results[0];
            //    json_res['recordsFiltered'] = results[0];
            json_res['data'] = results[0];
        }
        cb(json_res);
    })
};

exports.PublishInsight = (request, response) => {
    let postData = request.body;
    models.insights.findOne({ where: { id: postData.id }, required: false }).then(insights => {
        let result = {};
        if (insights) {
            insights.updateAttributes(postData).then((updateInsight) => {
                if (updateInsight) {
                    result.success = true;

                    result.message = 'Insight Publish successfully ';

                } else {
                    result.success = true;
                    result.message = 'Insight  not Publish successfully ';
                }

                response.json(result);
            })
        }
        else {
            result.success = false;
            result.message = 'Insight not existed.';
            response.json(result);

        }
    });
};

exports.InsightsCountByStatus = (request, response) => {
    let postData = request.body;
    models.insights.findAll({
        where: {
            $and: [
                { createdBy: postData.currentUserId },
                { status: postData.statuses }
            ]
        }
    }).then(insightsByStatus => {
        let result = {};
        if (insightsByStatus) {
            result.success = true;
            result.data = insightsByStatus;
        } else {
            result.success = false;
            result.data = 0;
        };
        response.json(result);
    })
}

exports.EditoriereInsightsCountByStatus = (request, response) => {
    let postData = request.body;
    models.insights.findAll({
        where: {
            $and: [
                { editorierId: postData.currentUserId },
                { status: postData.statuses }
            ]
        }
    }).then(insightsByStatus => {
        let result = {};
        if (insightsByStatus) {
            result.success = true;
            result.data = insightsByStatus;
        } else {
            result.success = false;
            result.data = 0;
        };
        response.json(result);
    })
}

exports.companyLatestInsights = (req, res) => {
    models.users.hasOne(models.user_profile);
    // models.users.hasMany(models.insights, { foreignKey: 'createdBy' });
    // models.users.findAll({
    //     attributes: ['first_name', 'last_name'],
    //     include: [
    //         {
    //             model: models.user_profile,
    //             attributes: ['profile_pic','userId','company_url'],
    //             where: { 'company_id': req.params.companyId }
    //         },
    //         {
    //             model: models.insights,
    //             attributes:['id'],
    //             where: { 'status': 'published' },
    //             required: true
    //         }
    //     ],
    //     limit: 3,
    //     raw: true
    // })
    models.insights.belongsTo(models.users);
    models.insights.hasOne(models.insights_views);
    models.insights.hasOne(models.insight_comments);
    models.insights.belongsTo(models.sectors);
    models.insights.belongsTo(models.currency);
    models.insights.belongsTo(models.regions);
    models.insights.belongsTo(models.commodities);
    models.insights.belongsTo(models.tickers);
    models.insights.findAll({
        where: { 'status': 'published' },

        include: [
            {
                model: models.users,
                attributes: ['first_name', 'last_name'],
                include: [
                    {
                        model: models.user_profile,
                        attributes: ['profile_pic', 'userId', 'company_url'],
                        where: { 'company_id': req.params.companyId }
                    }
                ],
            },
            {
                model: models.insights_views,
                attributes: [[Sequelize.literal('(select count(`insight_id`) from insights_views  where insights.id = insights_views.insight_id)'), 'viewCount']]
            },
            {
                model: models.insight_comments,
                attributes: [
                    //[Sequelize.fn('count',Sequelize.col('insightId')),'commentCount'],
                    [Sequelize.literal('(select count(`insightId`) from insight_comments  where insights.id = insight_comments.insightId)'), 'commentCount']
                ],
                where: { 'parent': null },
                required: false
            },
            {
                model: models.tickers,
                attributes: ['company', 'name', 'companyId'],
            },
            {
                model: models.commodities,
                attributes: ['id', 'name'],
            },
            {
                model: models.sectors,
                attributes: ['id', 'name'],
            },
            {
                model: models.currency,
                attributes: ['id', 'name'],
            },
            {
                model: models.regions,
                attributes: ['id', 'name'],
            },

        ],
        limit: 5,
        raw: true
    }).then(insights => {
        let response = {};
        if (insights) {
            response.success = true;
            response.data = insights;
        }
        else {
            response.success = false;
            response.message = 'No Insights found';
        }
        res.json(response);
    });
}

exports.companyInsights = (req, res) => {
    models.users.hasOne(models.user_profile);
    models.users.hasMany(models.insights, { foreignKey: 'createdBy' });
    models.users.findAll({
        attributes: ['first_name', 'last_name', 'email', 'id'],
        include: [
            {
                model: models.user_profile,
                attributes: ['profile_pic'],
                where: { 'company_id': req.params.companyId }
            },
            {
                model: models.insights,
            }
        ]
    }).then(insights => {
        let response = {};
        if (insights) {
            response.success = true;
            response.data = insights;
        }
        else {
            response.success = false;
            response.message = 'No Insights found';
        }
        res.json(response);
    });
}


exports.DeleteInsight = function (request, res) {

    let id = request.params.id;
    models.insight_attachements.findAll({
        where: { insightId: id },
        attributes: ['path']
    }).then(attachments => {
        let response = {};
        let files = [];
        if (attachments) {
            response.success = true;
            files = attachments.map(file => file.path);
            response.data = files;
        }
        models.insights.findOne({
            where: { id: id },
            attributes: ['summary', 'description']
        }).then(insights => {
            let images = utils.extractImgs(insights.summary);
            let descImage = utils.extractImgs(insights.description);
            if (images) {
                files = files.concat(images);
            }
            if (descImage) {
                files = files.concat(descImage);
            }
            let result = {};
            if (request.params.id != undefined) {
                models.insights.destroy({ where: { 'id': id } }).then((rowDeleted) => {
                    files.map(file => fs.unlinkSync('uploads/' + file));
                    result.success = true;
                    result.message = (rowDeleted === 1) ? 'insight deleted successfully' : 'Unable to delete insight';
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
    });
};

exports.DeleteInsightAttachements = function (request, res) {
    models.insight_attachements.findAll({
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
            models.insight_attachements.destroy({ where: { 'id': request.params.id } }).then((rowDeleted) => {
                files.map(file => fs.unlinkSync('uploads/' + file));
                result.success = true;
                result.message = (rowDeleted === 1) ? 'insight Attachments deleted successfully' : 'Unable to delete insight Attachments';
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

let result = {};
exports.CreateInsightComment = function (request, response) {
    let postData = request.body;
    models.insight_comments.create(postData).then(insight_comments => {
        let result = {};
        let postData = request.body;


        if (insight_comments) {
            models.users.hasOne(models.user_profile);
            models.users.findOne({
                attributes: ['first_name', 'last_name'],
                where: { id: insight_comments.from },
                include: [{ model: models.user_profile, attributes: ['profile_pic'], required: false }]
            }).then(user => {
                result.data = { 'comment': insight_comments, 'user': user };
                if (postData.files.length) {
                    let filesData = [];

                    for (let file in postData.files) {
                        var orgname = postData.files[file].split('-');
                        var mimetype = postData.files[file].split('.');

                        filesData[file] = { 'insightcommentId': insight_comments.id, 'path': postData.files[file], 'orgName': orgname[1], 'mime_type': mimetype[mimetype.length - 1] };
                    }
                    models.insight_comment_attachements.bulkCreate(filesData).then(function (test) {
                        result.success = true;
                        result.message = 'Comment successfully created';
                        return response.json(result);
                    }).catch(function (err) {
                        result.success = false;
                        result.message = err.message;
                        return response.json(result);
                    });
                }
                else {
                    result.success = true;
                    result.message = 'Comment successfully created';
                    return response.json(result);
                }


            });
        }
        else {
            noResults(result, response)

        }


    });

};

var upload = multer({ storage: utils.assestDest('insight_comment_files') }).single('file');

exports.InsightcommentUpload = function (request, response) {
    upload(request, response, function (err) {
        let json_data = {};
        json_data.success = false;
        if (request.file) {
            json_data['success'] = true;
            json_data['data'] = 'insight_comment_files/' + request.file.filename;
        }
        else {
            json_data.message = 'Comment successfully created';
        }
        response.json(json_data);
    });
}

//let result = {};
//var upload = multer({ storage : utils.assestDest('insights_attachements') }).single('file');
// exports.CreateInsightComment = function (request, response) {
//     getAccessLevelById(request.app.locals.decodedData['access_level'], access_level => {
//         let postData = request.body;
//         models.insight_comments.create(postData).then(insight_comments => {
//             let result = {};
//             let postData = request.body;
//             if (insight_comments) {
//                 if(postData.files.length){
//                     let filesData = [];                              
//                     for(let file in postData.files){
//                         var orgname = postData.files[file].split('-');
//                         var mimetype = postData.files[file].split('.');
//                         filesData[file] = {'insightId':insights.id,'path':postData.files[file],'orgName':orgname[1],'mime_type':mimetype[mimetype.length-1]};
//                     }
//                     postData.insightId = insights.id;
//                     models.insight_comment_attachements.bulkCreate(filesData).then(function(test) {
//                         result.success = true;
//                         result.message = 'insight_comment successfully created'; 
//                         return response.json(result);         
//                     }).catch(function(err){
//                         result.success = false;
//                         result.message = err.message; 
//                        return response.json(result);
//                     });
//                 models.users.hasOne(models.user_profile);
//                 models.users.findOne({
//                         attributes:['first_name','last_name'],
//                             where: {id: insight_comments.createdBy},
//                         include: [{ model: models.user_profile, attributes: ['profile_pic'], required: false }]
//                     }).then(user=>{

//                         result.data = {'comment':insight_comments,'user':user};
//                         //result.data = problem_comments;
//                         models.insights.findOne({ where: { id: postData.insightId }, required: false })
//                        .then(insight => {
//                           {                                           
//                                 result.success = true;

//                                     result.message = 'Comment successfuly sent.';

//                                     result.message = 'Comment successfuly sent.';

//                                 return response.json(result);
//                             }

//                             });

//             });
//         } 
//             else {
//                 result.success = false;
//                 result.message = 'Comment successfuly sent.';
//                 return response.json(result);

//             }
//         }
//         });
//     });
// }

exports.GetCommentInsights = (req, res) => {
    let parent = req.body.parent || null;
    models.insight_comments.belongsTo(models.users, { foreignKey: 'from' });
    models.insight_comments.hasMany(models.insight_comment_attachements);
    models.users.hasOne(models.user_profile);
    models.insight_comments.findAndCountAll({
        where: {
            insightId: req.params.id
            // parent: { $eq: parent }

        },
        order: [
            ['createdAt', 'DESC'],
        ],
        include: [
            {
                model: models.users,
                attributes: ['first_name', 'last_name'],
                include: [
                    {
                        model: models.user_profile,
                        attributes: ['profile_pic']
                    }]
            },
            {
                model: models.insight_comment_attachements,
                attributes: ['orgName', 'path']
            }
        ]

    })
        .then(insight_comments => {
            let response = {};

            if (insight_comments) {
                response.success = true;
                response.data = insight_comments;
            }
            else {
                response.success = false;
                response.message = 'No insight comment found';
            }
            res.json(response);
        });
}


//     let t = {};
//     let pdata = req.body;
//     async.parallel([
//         (callback) => {

//             $query = 'SELECT c.*,(select count(sc.id) as cat FROM `insight_comments` sc where sc.`parent`= c.`id`) as total FROM `insight_comments` c where `insightId`= 20 AND `parent`IS NULL';
//             db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT })
//             .then(record => {
//                 //response.recordsTotal = record.total;
//                 //response.recordsFiltered = record.total;
//                 Object.assign(t,{'total':record});
//                 callback(null, {'total':record});
//             }).catch(function (err) {
//                 callback(err);
//             });
//         },     
//         (callback) => {
//             $query = `SELECT c.*,(select count(sc.id) FROM insight_comments sc
//              where sc.parent= c.id) total, u.first_name,u.last_name,
//              icf.path ,icf.orgName,
//              u.id,up.profile_pic FROM insight_comments c 
//              left outer join insight_comment_attachements icf ON icf.insightcommentId =c.id
//              left outer join users u ON u.id = c.from
//              left outer join user_profile up ON up.userId = u.id
//              where insightId = ${req.params.id} AND parent IS NULL`;               

//                 db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT })
//                     .then(insight_comments => {
//                         Object.assign(t,{'data':insight_comments});                        
//                         callback(null, {'data':insight_comments}); 
//                      });
//         },
//     ], (err, results) => { 
//         let json_res = {};
//         json_res['draw'] = pdata.draw;
//         if (err) {
//             json_res['success'] = false;
//             json_res['recordsTotal'] = 0;
//             json_res['recordsFiltered'] = 0;
//             json_res['message'] = err;
//             json_res['data'] = [];
//         }
//         else {
//             json_res['success'] = true;
//             json_res['recordsTotal'] = t.total[0].total;
//             json_res['recordsFiltered'] = t.total[0].total;
//             json_res['data'] = t.data;            
//         } 
//         res.json(json_res);
//     })



// }


exports.GetComment = (req, res) => {
    models.insight_comments.findOne({ where: { insightId: req.params.id } })
        .then(comment => {
            result = {};
            if (comment) {
                result.success = true;
                result.data = comment;

            } else {
                result.success = false;
                result.message = 'No Record Found';
            }
            // res.json(result);
            // });

            (err, results) => {
                let json_response = {};

                json_res['draw'] = pData.draw;
                if (err) {
                    json_response['success'] = false;
                    json_response['recordsTotal'] = 0;
                    json_response['recordsFiltered'] = 0;
                    json_response['message'] = err;
                    json_response['data'] = [];
                }
                else {
                    json_response['success'] = true;
                    json_response['recordsTotal'] = results[0];
                    json_response['recordsFiltered'] = results[0];
                    json_response['data'] = results[1];
                }
                cb(json_response);


            }
        });
}
exports.CreateInsightViews = function (request, response) {
    let postData = request.body;
    models.insights_views.findOne({
        where: {
            $and: [
                { 'insight_id': postData.insightId },
                { 'viewedBy': postData.viewedBy }
            ]
        }
    }).then(insightsViews => {
        let result = {};
        if (insightsViews) {
            result.success = false;
            result.message = 'This user already view this insight';
            response.json(result);
        } else {
            models.insights_views.create(postData).then(insightView => {
                if (insightView) {
                    result.success = true;
                    result.message = 'InsightView Successfully created';
                } else {
                    result.success = true;
                    result.message = 'InsightView Not Successfully created';
                }
                response.json(result);
            })
        }
    })
}
exports.InsightViewsCount = function (request, response) {
    models.insights_views.count({
        where: { 'insight_id': request.params.id }
    }).then(insightsViewsCount => {
        let result = {};
        if (insightsViewsCount) {
            result.success = false;
            result.count = insightsViewsCount;
            response.json(result);
        } else {
            result.success = false;
            result.count = 0;
            response.json(result);
        }
    })
}
exports.InsightCommentsCount = function (request, response) {
    models.insight_comments.count({
        where: {
            $and: [
                { 'insightId': request.params.id },
                { 'parent': null }
            ]
        }
    }).then(insightsCommentsCount => {
        let result = {};
        if (insightsCommentsCount) {
            result.success = false;
            result.count = insightsCommentsCount;
            response.json(result);
        } else {
            result.success = false;
            result.count = 0;
            response.json(result);
        }
    })
}
exports.AddWatchlist = function (request, response) {
    let postData = request.body;
    postData.userId = request.app.locals.decodedData.id;

    models.watch_lists.findOne({
        where: postData
    }).then(insightsWatchList => {
        let result = {};
        if (insightsWatchList) {
            result.success = false;
            result.message = 'You already Added this to your Watchlist';
            response.json(result);
        } else {
            models.watch_lists.create(postData).then(insightWatchlist => {
                if (insightWatchlist) {
                    result.success = true;
                    result.message = 'Successfully Added this to your Watchlist';
                } else {
                    result.success = true;
                    result.message = 'InsightWatchlist Not Successfully created';
                }
                response.json(result);
            })
        }
    })
}

exports.addInsightRating = function(request, response){
    let postData = request.body;

    models.rating.findOne({
        where: {
            $and: [
                { 'insightId': postData.insightId },
                { 'userId': postData.userId }
            ]
        }
    }).then(insightsRating => {
        let result = {};
        if (insightsRating) {

            insightsRating.updateAttributes(postData).then((updateInsight) => {
                if (updateInsight) {
                    result.success = true;

                    result.message = 'Your Rating Updated Successfully ';

                } else {
                    result.success = true;
                    result.message = 'Updating failed ';
                }

                response.json(result);
            })
           
        } else {
            models.rating.create(postData).then(insightWatchlist => {
                if (insightWatchlist) {
                    result.success = true;
                    result.message = 'Your Rating Successfully Submitted';
                } else {
                    result.success = true;
                    result.message = 'Submitting Rating Failed';
                }
                response.json(result);
            })
        }
    })
}

exports.getInsightRating = function(request, response){
    let postData = request.body;

    models.rating.findOne({
        where: {
            $and: [
                { 'insightId': postData.insightId },
                { 'userId': postData.userId }
            ]
        }
    }).then(insightsRating => {
        let result = {};
        if (insightsRating)
        {                
            result.success = true;
            result.rating = insightsRating.rating;
        }else
        {
            result.success = true;
            result.rating = 0;
        }
        response.json(result);        
    })
}
//     models.watch_list.create(request.body).then(watch_list => {
//         let result = {};
//         if (watch_list) {
//             result.success = true;
//             result.message = 'Successfully Added the Watch_list';          
//             res.json(result);
//         }
//         else {
//             noResults(result, res)
//         }
//     });
// }
// models.watch_list.findOne({
//     where: {
//         $and: [
//             { 'userId': postData.userId },
//             { 'type': postData.type },
//             { 'type_id': postData.type_id },
//         ]
//     }
// }).then(insightsWatchlists => {
//     let result = {};
//     if (insightsWatchlists) {
//         result.success = false;
//         result.message = 'This insight already add the watchlist';
//         response.json(result);
//     } else {
//         models.watch_list.create(postData).then(insightsWatchlist => {
//             if (insightsWatchlist) {
//                 result.success = true;
//                 result.message = ' Successfully Added the Watch_list';
//             } else {
//                 result.success = true;
//                 result.message = ' Not the  Add Watch_list';
//             }
//             response.json(result);
//         })
//     }
// })
exports.GetVerticalUserInsights = (req, res) => {
    VerticalInsights(req.params.user, verticaliInsights => {
        let response = {};
        if (verticaliInsights) {
            response.success = true;
            response.data = verticaliInsights;
        }
        else {
            response.success = false;
            response.message = 'No Insights found';
        }
        res.json(response);
    });
}

exports.GetVerticalCompanyInsights = (req, res) => {
    GetUsersByCompany(req.params.companyId, userIds => {
        VerticalInsights(userIds, verticaliInsights => {
            let response = {};
            if (verticaliInsights) {
                response.success = true;
                response.data = verticaliInsights;
            }
            else {
                response.success = false;
                response.message = 'No Insights found';
            }
            res.json(response);
        });
    });
}

VerticalInsights = (data, cb) => {
    models.insights.belongsTo(models.commodities);
    models.insights.findAll({
        attributes: ['createdBy', 'commodityId'],
        where: {
            $and: [
                { 'createdBy': data },
                { 'status': 'published' }
            ],
            $or: [
                { 'type': 'In-depth' },
                { 'type': 'quick-note' },
            ]
        },
        include: [
            {
                model: models.commodities,
                attributes: ['id', 'name'],
            }
        ]
    }).then(insights => {
        cb(insights)
    })
};
exports.GetSectorUserInsights = (req, res) => {
    GetSectorInsights(req.params.user, sectorInsights => {
        let response = {};
        if (sectorInsights) {
            response.success = true;
            response.data = sectorInsights;
        }
        else {
            response.success = false;
            response.message = 'No Insights found';
        }
        res.json(response);
    });
}

exports.GetSectorCompanyInsights = (req, res) => {
    GetUsersByCompany(req.params.companyId, userIds => {
        GetSectorInsights(userIds, sectorInsights => {
            let response = {};
            if (sectorInsights) {
                response.success = true;
                response.data = sectorInsights;
            }
            else {
                response.success = false;
                response.message = 'No Insights found';
            }
            res.json(response);
        });
    });
}

GetSectorInsights = (data, cb) => {
    models.insights.belongsTo(models.tickers);
    models.insights.belongsTo(models.sectors);
    models.tickers.belongsTo(models.sectors, { foreignKey: 'sectorId' });
    models.insights.findAll({
        attributes: ['createdBy', 'commodityId'],
        where: {
            $and: [
                { 'createdBy': data },
                { 'status': 'published' }
            ],
            $or: [
                { 'tickerId': { $ne: null } },
                { 'sectorId': { $ne: null } },
            ]
        },
        include: [
            {
                model: models.tickers,
                attributes: ['name', 'companyId', 'sectorId'],
                include: [
                    {
                        model: models.sectors,
                        attributes: ['id', 'name'],
                    },
                ]
            },
            {
                model: models.sectors,
                attributes: ['id', 'name'],
            },
        ]
    }).then(insights => {
        cb(insights)
    })
}

GetUsersByCompany = (data, cb) => {
    models.users.hasOne(models.user_profile);
    models.insights.belongsTo(models.commodities);
    models.users.hasMany(models.insights, { foreignKey: 'createdBy' });
    models.users.findAll({
        attributes: ['id'],
        include: [
            {
                model: models.user_profile,
                attributes: ['userId'],
                where: { 'company_id': data }
            }
        ]
    }).then(insights => {
        let userIds = [];
        insights.forEach(val => {
            userIds.push(val.id)
        });
        cb(userIds)
    });
};

profileCount = (data, cb) => {
    models.insights.hasOne(models.insights_views, { foreignKey: 'insight_id' })
    models.insights.findOne({
        attributes: [[Sequelize.fn('count', Sequelize.col('insights.id')), 'insCount']],
        where: {
            $and: [
                { 'createdBy': data },
                { 'status': 'published' }
            ]
        },
        include: [
            {
                model: models.insights_views,
                attributes: [[Sequelize.fn('count', Sequelize.col('insight_id')), 'viewCount']]
            }
        ]
    }).then(count => {
        cb(count);
    })
};

followerCount = (data, cb) => {
    models.analysts_followers.count({
        where: { 'analyst_id': data }
    }).then(count => {
        cb(count);
    })
}

exports.GetUserInsightCount = (req, res) => {
    profileCount(req.params.user, count => {
        let response = {};
        response.success = true;
        response.data = count;
        res.json(response);
    });
};
exports.GetUserFollowCount = (req, res) => {
    followerCount(req.params.user, count => {
        let response = {};
        response.success = true;
        response.data = count;
        res.json(response);
    });
};
exports.GetCompanyFollowCount = (req, res) => {
    followerCount(req.params.user, count => {
        let response = {};
        response.success = true;
        response.data = count;
        res.json(response);
    });
};
exports.GetCompanyInsightCount = (req, res) => {
    GetUsersByCompany(req.params.companyId, userIds => {
        profileCount(userIds, count => {
            let response = {};
            response.success = true;
            response.data = count;
            res.json(response);
        });
    });
}