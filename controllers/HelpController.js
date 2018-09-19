var models = require('../models');
var Sequelize = require('sequelize');
var jwt = require('jsonwebtoken');
var config = require('./../config/config.json')['system'];
var utils = require('./../helpers/utils.js');
const Op = Sequelize.Op;
var async = require('async');
var multer = require('multer');
var md5 = require('md5');
var fs = require('fs');
var crypto = require('crypto');
var db = require('../models/index');
var models = require('../models');
//var app   = require('../app');
exports.CreateHelp = function (request, response) {

    let postData = request.body;
    //return response.json(postData);
    let result = {};
    models.problems.create(postData).then(problems => {
        let result = {};
        if (problems) {
            if (postData.files.length) {
                let filesData = [];
                // for (let file in postData.files) {
                //     filesData[file] = { 'problemId': problems.id, 'path': postData.files[file] };
                // }
                for (let file in postData.files) {
                    var orgname = postData.files[file].split('-');
                    var mimetype = postData.files[file].split('.');

                    filesData[file] = { 'problemId': problems.id, 'path': postData.files[file], 'orgName': orgname[1], 'mime_type': mimetype[mimetype.length - 1] };
                }
                models.problem_files.bulkCreate(filesData).then(function (test) {
                    result.success = true;
                    result.message = 'Problem successfully created';
                    return response.json(result);
                }).catch(function (err) {
                    result.success = false;
                    result.message = err.message;
                    return response.json(result);
                });
            }
            else {
                result.success = true;
                result.message = 'Problem successfully created';
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


createProblemFiles = (postData, cb) => {
    models.problem_files.create(postData).then(problem_files => {
        cb(problem_files);
    });
}


let result = {};
exports.CreateHelpComment = function (request, response) {
    getAccessLevelById(request.app.locals.decodedData['access_level'], access_level => {
        let postData = request.body;
        models.problem_comments.create(postData).then(problem_comments => {
            let result = {};
            let postData = request.body;
            if (problem_comments) 
            
            {
                models.users.hasOne(models.user_profile);
                models.users.findOne({
                        attributes:['first_name','last_name'],
                            where: {id: problem_comments.createdBy},
                        include: [{ model: models.user_profile, attributes: ['profile_pic'], required: false }]
                    }).then(user=>{
                        
                        result.data = {'comment':problem_comments,'user':user};
                        //result.data = problem_comments;
                        models.problems.findOne({ where: { id: postData.problemId }, required: false })
                    .then(problems => {
                        if (problems) {
                            let prbData = {};
                            if (problems.status !== postData.status) {
                                Object.assign(prbData, {
                                    'status': postData.status,
                                    'updatedBy': postData.createdBy
                                });
                                if (access_level.name === 'Admin') {
                                    Object.assign(prbData, { 'is_read': true });
                                }
                                if (postData.status === 'Resolved') {
                                    Object.assign(prbData, {
                                        'resolvedBy': postData.createdBy,
                                        'resolved_date': db.sequelize.fn('NOW')
                                    });
                                }
                            }
                            if (!problems.is_read) Object.assign(prbData, { 'is_read': true });
                            problems.updateAttributes(prbData).then((updateProblem) => {
                                result.success = true;
                                if (updateProblem) {
                                    result.message = 'Comment successfuly sent.';
                                } else {
                                    result.message = 'Comment successfuly sent. problem with status change';
                                }
                                return response.json(result);
                            });
                        }
                        else {
                            result.success = false;
                            result.message = 'Unable to find problem.';
                            return response.json(result);
                        }
                    })
                    });
                
            }
            else {
                result.success = false;
                result.message = 'Unable to create message.';
                return response.json(result);
            }
        });
    });
}

//Get Problems values with view component purpose
exports.GetProblems = (req, res) => {
    // updateProblemRead(req, res)
    // models.problems.hasMany(models.problem_files);
    // models.problems.findOne({
    //         where: { id: req.params.id },
    //         include: [{ model: models.problem_files, attributes: ['path'], required: false }]
    //     })

    $query = `select 
p.subject,p.description,p.is_read,p.createdBy,p.updatedBy,p.status,
p.createdAt,p.updatedAt,p.id as pid,
u.first_name,u.last_name,
u.id,pf.path,pf.orgName
FROM problems p 
inner join users u ON u.id=p.createdBy 
left outer join problem_files pf
ON pf.problemId =p.id
where p.id=${req.params.id}`;


    db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT })
        .then(problems => {

            let response = {};
            if (problems) {

                response.success = true;
                response.data = problems;
            }
            else {
                response.success = false;
                response.message = 'No Problems found';
            }
            res.json(response);
        })

}


var Iuploads = multer({ storage: utils.assestDest('help-summary-files') }).array('userphoto');

exports.UploadImage = function (request, response) {
    Iuploads(request, response, function (err) {
        
        let json_data = {};
      
        json_data.success = false;
        if (request.files) {
            json_data['data']=[];
            (request.files).forEach(file=>{
                json_data['data'].push('help-summary-files/' + file.filename);
            })
         
            json_data['success'] = true;
      
        }
        else {
            json_data.message = err.message;
        }
        response.json(json_data);
        
    });
   
}

// var storage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, 'uploads/case_files');
//     },
//     filename: function (req, file, callback) {
//         callback(null, md5(Date.now()) + '-' + file.originalname);
//     }
// });
var upload = multer({ storage: utils.assestDest('case_files') }).single('file');

exports.Upload = function (request, response) {
    upload(request, response, function (err) {
        let json_data = {};
        json_data.success = false;
        if (request.file) {
            json_data['success'] = true;
            json_data['data'] = 'case_files/' + request.file.filename;
        }
        else {
            json_data.message = err.message;
        }
        response.json(json_data);
    });
}



exports.FilterProblems = (req, res) => {

    filterProblems(req, res, (records) => {
        return res.json(records);
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

exports.UpdateUnread = (req, res) => {
    let result = {};
    models.problem_comments.update({ is_read: 1 }, { where: req.body }).then(data => {
        result.success = true;
        result.message = 'Updated Successfully';
        res.json(result);
    })
        .catch(err => {
            result.success = false;
            result.message = err.message;
            res.json(result);
        })
}
getAccessLevelById = (access_level_id, cb) => {
    models.access_levels
        .findOne({
            where: {
                id: access_level_id,
                status: 'active'
            }
        }).then(access_level => {
            cb(access_level);
        })
}

exports.fetchCounts = (req, res) => {
    let result = {};
    getAccessLevelById(req.app.locals.decodedData['access_level'], access_level => {
        
        async.parallel([
            (callback) => {
                if (access_level.name === 'Admin') {
                    $query = `select p.subject as message, p.status, p.is_read, p.createdAt,p.id as pid,
                                u.first_name,u.last_name,u.id,up.profile_pic,p.id as problemId
                                FROM problems p 
                                inner join users u ON (u.id=p.createdBy AND (p.is_read = 0 OR p.is_read IS NULL))
                                left outer join user_profile up ON up.userId = u.id`;
                    db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT }).then(problems => {
                        callback(null, { 'problems': problems });
                    }).catch(function (err) {
                        callback(err);
                    });
                }
                else {
                    callback(null, { 'problems': [] });
                }
            },
            (callback) => {

                $query = `select pc.message, pc.createdAt, pc.createdBy,
                            u.first_name,u.last_name,u.id,up.profile_pic,pc.problemId
                            FROM problem_comments pc 
                            inner join users u ON (u.id=pc.createdBy AND (pc.is_read = 0 OR pc.is_read IS NULL))
                            left outer join user_profile up ON up.userId = u.id
                            where pc.msgTo=${req.params.id}`;

                db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT }).then(problem_comments => {
                    callback(null, { 'problem_comments': problem_comments });
                })
                    .catch(function (err) {
                        callback(err);
                    });

            }
        ], (err, results) => {

            result.success = true;
            result.count = 0;
            result.data = [];
            if (!err) {
                if ((results[0].problems).length) {
                    (results[0].problems).forEach(item => {
                        (result.data).push(item);
                        result.count++;
                    });
                }
                if ((results[1].problem_comments).length) {
                    (results[1].problem_comments).forEach(item => {
                        (result.data).push(item);
                        result.count++;
                    });
                }
            }
            res.json(result);
        });
    });
}

filterProblems = (req, res, cb) => {
    pData = req.body;
    // updateProblemRead(req, res)
    $query = `select 
    p.subject,p.description,p.status,p.is_read,
    p.createdAt,p.id as pid,
    u.first_name,u.last_name,
    u.id,up.profile_pic,up.company_name,company_id,
    cd.name as companyName,
    CONCAT( u.first_name,'' ,u.last_name),
    (SELECT count(*) FROM problem_comments pc 
    WHERE pc.problemId=p.id and pc.msgTo =${pData.currentUserId} and (pc.is_read=0 or pc.is_read IS NULL)) as unread
    FROM problems p 
    inner join users u ON u.id=p.createdBy  
    left outer join user_profile up ON up.userId = u.id
    left outer join company_details cd ON up.company_id = cd.id`;
    
    let pCols = ['subject', 'status', 'id', 'createdBy', 'description'];
    let uCols = ['first_name', 'last_name', 'id'];


    where = sort = {};
    let i = false;
    if (pData.columns.length) {

        (pData.columns).forEach(col => {

            if (String(col.search.value).length) {
                let prefix = utils.inArray(col.data, pCols) ? 'p.' : 'u.';
                $query += (!i) ? ' WHERE (' : ' AND ';
                $query += `${prefix + col.data}='${col.search.value}'`;
                i = true;
            }
        });
        if (i) $query += ') ';
        let j = false;
        if ((pData.search.value).length) {
            (pData.columns).forEach(col => {
                let prefix = utils.inArray(col.data, pCols) ? 'p.' : 'u.';
                $query += (!i) ? ' WHERE (' : ((j) ? ' OR ' : 'AND (');
                $query += `${prefix + col.data} LIKE '%${pData.search.value}%' `;
                i = j = true;
            })
            $query += (!i) ? ' WHERE (' : ((j) ? ' OR ' : 'AND (');
            $query += `CONCAT( u.first_name,' ',u.last_name) LIKE '%${pData.search.value}%' `;
        }
  
        if (j) $query += ') ';
    }

    if (pData.order.length) {
        $query += ' order by ' + pData.order[0].column + ' ' + pData.order[0].dir + ' ';
    }


    async.parallel([
        (callback) => {
            db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT }).then(projects => {
                callback(null, projects.length);
            }).catch(function (err) {
                callback(err);
            });
        },
        (callback) => {
            $query += ' limit ' + pData.start + ', ' + pData.length + ' ';

            db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT }).then(problems => {
                callback(null, problems);
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


// filterProblems = (req, res, cb) => {
//     pData = req.body;

//     where = sort = {};
//     if (pData.columns.length) {

//         (pData.columns).forEach(col => {

//             if (String(col.search.value).length) {
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
//             // where = {[Op.or] : likeCond};
//             Object.assign(where, { [Op.or]: likeCond });
//         }
//     }

//     let orderBy = [pData.order[0].column, pData.order[0].dir];

//     async.parallel([
//         (callback) => {
//             models.problems.findAll({ where: where, attributes: ['id'] }).then(projects => {
//                 callback(null, projects.length);
//             }).catch(function (err) {
//                 callback(err);
//             });
//         },       
//         (callback) => {


//             models.users.hasMany(models.problems,{foreignKey:'createdBy'});
//             models.problems.hasMany(models.problem_files);
//             models.users.findAll({

//                 attributes: ['first_name','last_name'],
//                 include: [
//                     {
//                         model: models.problems,
//                         attributes: ['id','subject','status','description','createdAt','createdBy'],
//                         required: true,
//                         include : [{ model: models.problem_files, attributes: ['path'], required: false }]
//                     }
//                 ]

//             }).then(problemUserlist => {
//                     callback(null, problemUserlist);
//                 })
//                 .catch(function (err) {
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
//             json_res['success'] = true;
//             json_res['recordsTotal'] = results[0];
//             json_res['recordsFiltered'] = results[0];
//             json_res['data'] = results[1];
//         }
//         cb(json_res);
//     })
// };

// exports.GetReplyProblems = (req, res) => {

//     models.problem_comments.findAll({
//         where: { problemId: req.params.id }

//     })
//                 models.users.findOne({

//                 attributes: ['first_name','last_name'],
//                 // include: [
//                 //     {
//                 //         model: models.problems,
//                 //         attributes: ['id','subject','status','description','createdAt','createdBy'],
//                 //         required: true,
//                 //         include : [{ model: models.problem_files, attributes: ['path'], required: false }]
//                 //     }
//                 // ]

//             })
//     .then(problem_comments => {
//         let response = {};

//         if (problem_comments) {
//             response.success = true;

//             response.data = problem_comments

//         }
//         else {
//             response.success = false;
//             response.message = 'No problems found';
//         }

//         res.json(response);

//     });

// }


exports.GetReplyProblems = (req, res) => {
    let t = {};
    let pdata = req.body;
    async.parallel([
        (callback) => {
            $query = `select count(*) as total FROM problem_comments where problemId = ${req.params.id} `;
            db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT })
            .then(record => {
                //response.recordsTotal = record.total;
                //response.recordsFiltered = record.total;
                Object.assign(t,{'total':record});
                callback(null, {'total':record});
            }).catch(function (err) {
                callback(err);
            });
        },
        (callback) => {
            $query = `select 
                pc.message,pc.createdBy,pc.is_read,pc.msgTo,pc.id as pcid,
                pc.createdAt,pc.problemId,
                u.first_name,u.last_name,
                u.id,up.profile_pic 
                FROM problem_comments pc 
                inner join users u ON u.id=pc.createdBy 
                left outer join user_profile up ON up.userId = u.id
                where pc.problemId = ${req.params.id} `;
                $query += 'order by '+pdata.order[0].column+' '+pdata.order[0].dir+' ';
                $query += ' limit '+pdata.start+', '+pdata.length;

                db.sequelize.query($query, { type: Sequelize.QueryTypes.SELECT })
                    .then(problem_comments => {
                        Object.assign(t,{'data':problem_comments});                        
                        callback(null, {'data':problem_comments});

                    });
        }
    ], (err, results) => { 
        let json_res = {};
        json_res['draw'] = pdata.draw;
        if (err) {
            json_res['success'] = false;
            json_res['recordsTotal'] = 0;
            json_res['recordsFiltered'] = 0;
            json_res['message'] = err;
            json_res['data'] = [];
        }
        else {
            json_res['success'] = true;
            json_res['recordsTotal'] = t.total[0].total;
            json_res['recordsFiltered'] = t.total[0].total;
            json_res['data'] = t.data;
        } 
        res.json(json_res);
    })

    
    
}

exports.GetComment = (req, res) => {
    models.problem_comments.findOne({ where: { id: req.params.id } })
        .then(comment => {
            result = {};
            if (comment) {
                result.success = true;
                result.data = comment;
            } else {
                result.success = false;
                result.message = 'No Record Found';
            }
            res.json(result);            
        });
}