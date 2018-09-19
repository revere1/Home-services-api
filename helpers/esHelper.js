 var esclient = require('../config/elastic');
 var config = require('./../config/config.json')['system'];
 var utils = require('./utils');

exports = module.exports = {
    createIndex: function(indexid, indexbody,index,cb,prefix=config.ES_INDEX_PREFIX){
        indexbody = utils.DeepStripHtml(indexbody);
        esclient.index({  
            index: prefix+index,
            type: index,
            id: indexid,
            body: indexbody
        },function(err,resp,status) {
            cb(err,resp);
        });
    },
    createBulkIndex: function(bulkIndexData,cb){
        var t1 = new Date();
        esclient.bulk({
            body : bulkIndexData
        },function(err,resp,status) {
            var t2 = new Date();
            console.log('----time taken in indexing-----',t2-t1); 
            if(cb) {
                cb();
            }
        });
    },
    getElasticSearchDataById: function(indexId,type,cb,index=config.ES_INDEX_NAME){
        esclient.get({
            index: index,
            type: type,
            id: indexId
        }, function (error, response) {
            cb(error, response);
        });
    },
    getOrderDataByID: function(type,_sessID,_orderID,cb,index=config.ES_INDEX_NAME){
        esclient.search({
            index: index,
            type: type,
            body: {
                query: {
                    match: {
                        id:_sessID+_orderID
                    }
                }
            }
        }).then(function (resp) {
            return cb({},resp.hits.hits);
        }, function (err) {
            return cb(err,{});
        });
    },
    getElasticSearchDataByIds: function(indexIds,type,cb,index=config.ES_INDEX_NAME){
        esclient.mget({
            index: index,
            type: type,
            body: {
                ids: indexIds
            }
        }, function(error, response){
            cb(error,response);
        });
    },
    getElasticSearchDataByIdsForType: function(indexIds,type,cb,index=config.ES_INDEX_NAME){
        esclient.mget({
            index: index,
            type: type,
            body: {
                ids: indexIds
            }
        }, function(error, response){
            cb(error,response);
        });
    },
    getResults: function(term,cb,index=config.ES_INDEX_NAME){
        esclient.search({
            index: index,
            q: '*'+term+'*'
          }, function (error, response) {
                cb(error, response);
          });
    },
    getInsights: function(term,type,cb,prefix=config.ES_INDEX_PREFIX){
        esclient.search({
            index: prefix+type,
            type: type,
            q: '*'+term+'*'
          }, function (error, response) {
                cb(error, response);
          });
    },
    getTickers: function(term,type,cb,prefix=config.ES_INDEX_PREFIX){
        esclient.search({
            index: prefix+type,
            type: type,
            q: '*'+term+'*'
          }, function (error, response) {
                cb(error, response);
          });
    },
    deleteIndexes: function(cb,index='_all'){
        esclient.indices.delete({
            index: index
        }, function(err, res) {        
            if (err) {       
                cb({success:false,message:err.message});
            } else {
                cb({success:true,message:'Indexes have been deleted!'});                
            }
        });
    },
    getUsers: function(term,index,cb,body={},prefix=config.ES_INDEX_PREFIX){
        utils.getAccessLevel('Analyst',(aLobj)=>{
            esclient.search({
                index: prefix+index,
                type: index,
                body : {
                "query": {
                    "bool": {
                        "must":  [
                            {
                                "query_string": {
                                    "query": term+"*",
                                    "fields": ["first_name", "last_name"]
                                }
                            },               
                            {"term": 
                                {"access_level": aLobj.id}
                            }
                        ]
                        
                    }
                }
            }
               
              }, function (error, response) {
                    cb(error, response);
              });
        });
        
    },
    pickFilterData: function(response,cb){
        
        let result = {};
            if (response.hits !== undefined) {
                if (response.hits.total !== undefined && (response.hits.total)) {
                    
                    utils.seperteByKey(response.hits.hits, finalData => {
                        result.success = true;                        
                        result.data = finalData;
                        cb(result);
                    });
                }
                else {
                    result.success = false;
                    result.message = 'No Results Found';
                    cb(result);
                }
            }
            else {
                result.success = false;
                result.message = 'No Results Found';
                cb(result);
            }
    },
    deleteDocument: function(id, index, cb, prefix=config.ES_INDEX_PREFIX){
        esclient.delete({
            index: prefix+index,
            type: index,
            id: id
          }, function (error, response) {
            let result = {};
            if(error){
                result.success = false;
                result.message = err.message;
            }
            else{
                result.success = true;
                result.message = "Record deleted successfully";
            }
            cb(result);
        });
    } 
}
