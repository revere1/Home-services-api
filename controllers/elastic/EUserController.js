var models = require('./../../models');
//var Sequelize = require('sequelize');
var config = require('./../../config/config.json')['system'];
var es = require('./../../helpers/esHelper');

//var async = require('async');
//var db = require('./../models/index');

exports = module.exports = {
    createUpdateUser : (userid,cb) => {
        let result = {};
        models.users.hasOne(models.user_profile);
        models.users.findOne({
            where:{id:userid},
            attributes: ['id','first_name','last_name','email',
                    'contact_number','access_level','createdAt'],
            include:[{
                model: models.user_profile,
                attributes: ['company_name','city','zip_code','profile_pic']
            }]
        }).then(data => { 
            data = data.toJSON();
            
            if(data){                
                es.createIndex(userid, data,config.ES_INDEX_USERS,(err,response)=>{                   
                    if(!err){
                        result.success = true;
                        result.data = response;
                    }
                    else{
                        result.success = false;
                        result.message = err;
                    }
                    cb(result);
                });
            }          
            else{
                result.success = false;
                result.message = 'No Record Found';
                cb(result);
            }
              
        }).
        catch(err=>{
            result.success = false;
            result.message = err;
            cb(result);
        });    
    },
    createUpdateTicker : (tickerid,cb) => {
        let result = {};
        models.tickers.belongsTo(models.sectors);
        models.tickers.findOne({
            where:{id:tickerid},
            attributes: ['id','name','company','industry',
                    'company_url','createdAt'],
            include:[{
                model: models.sectors,
                attributes: ['id','name']
            }]
        }).then(data => {  
            if(data){
                data = data.toJSON();
                es.createIndex(tickerid, data,config.ES_INDEX_TICKERS,(err,response)=>{
                    if(!err){
                        result.success = true;
                        result.data = response;
                    }
                    else{
                        result.success = false;
                        result.message = err;
                    }
                    cb(result);
                });
            }
            else{
                result.success = false;
                result.message = "Record Not Found";
                cb(result);
            }             
        }).
        catch(err=>{
            result.success = false;
            result.message = err;
            cb(result);
        });    
    },
    deleteIndexes: (cb) => {
        es.deleteIndexes(response=>{
            cb(response);
        });
    },
    getResults: (term,cb) => {
        es.getResults(term,(err,response)=>{
            cb(err,response);
        });
    },
    seperteByKey:(data,cb)=>{
        let finalData = {};
        data.forEach(item => {            
            if(finalData[item._type] === undefined){
                finalData[item._type] = [];
            }                   
            finalData[item._type].push(item._source);          
        });
        cb(finalData);
    },
    getAnalysts: (req,res) => {
        es.getUsers(req.query.term,config.ES_INDEX_USERS,(err,response)=>{
            es.pickFilterData(response,(result)=>{
                res.json(result);
            });
        },{ term: { access_level:2 }});
    },
    deleteUser: (uid,cb) => {
        es.deleteDocument(uid, config.ES_INDEX_USERS, (res)=>{
            cb(res);
        });
    },
    deleteTicker: (tid,cb) => {
        es.deleteDocument(tid, config.ES_INDEX_TICKERS, (res)=>{
            cb(res);
        });
    }
    
}
