var models = require('./../../models');
//var Sequelize = require('sequelize');
var config = require('./../../config/config.json')['system'];
var es = require('./../../helpers/esHelper');
var utils = require('./../../helpers/utils');
//var async = require('async');
//var db = require('./../models/index');

exports = module.exports = {
       
    GetInsights: (req,res) => {
        es.getInsights(req.query.term,config.ES_INDEX_INSIGHTS,(err,response)=>{
            let result = {};
            if (response.hits !== undefined) {
                if (response.hits.total !== undefined && (response.hits.total)) {
                    utils.seperteByKey(response.hits.hits, finalData => {
                        result.success = true;
                        result.data = finalData;
                        res.status(201).json(result);
                    });
                }
                else {
                    result.success = false;
                    result.message = 'No Results Found';
                    res.json(result);
                }
            }
            else {
                result.success = false;
                result.message = 'No Results Found';
                res.json(result);
            }
        });
    },

    GetTickers: (req,res) => {
        es.getTickers(req.query.term,config.ES_INDEX_TICKERS,(err,response)=>{
            let result = {};
            if (response.hits !== undefined) {
                if (response.hits.total !== undefined && (response.hits.total)) {
                    utils.seperteByKey(response.hits.hits, finalData => {
                        result.success = true;
                        result.data = finalData;
                        res.status(201).json(result);
                    });
                }
                else {
                    result.success = false;
                    result.message = 'No Results Found';
                    res.json(result);
                }
            }
            else {
                result.success = false;
                result.message = 'No Results Found';
                res.json(result);
            }
        });
    },
    createUpdateInsight: (insightid,cb) => {
        let result = {};
        models.insights.belongsTo(models.commodities);
        models.insights.belongsTo(models.tickers);
        models.insights.findOne({
            where:{id:insightid},       
            include:[{
                    model: models.commodities,
                    attributes: ['id','name']
                },
                {
                    model: models.tickers,
                    attributes: ['name','company','industry','company_url']
                }
            ]
        }).then(data => {  
            data = data.toJSON();
            if(data){
                if(data.status === 'published'){
                    es.createIndex(insightid, data,config.ES_INDEX_INSIGHTS,(err,response)=>{
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
                    result.message = 'Unpublished insight';
                    cb(result);
                }
                
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
    deleteInsight: (insightid,cb) => {
        es.deleteDocument(insightid, config.ES_INDEX_INSIGHTS, (res)=>{
            cb(res);
        });
    }
}
