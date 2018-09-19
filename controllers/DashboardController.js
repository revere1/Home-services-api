var models = require('../models');
var Sequelize = require('sequelize');
var jwt = require('jsonwebtoken');
var config = require('./../config/config.json')['system'];
var utils = require('./../helpers/utils.js');
const Op = Sequelize.Op;
var fs = require('fs');
var async = require('async');


exports.TrendingInsights = (request, response) => {
    models.insights.hasMany(models.insights_views);
    models.insights.belongsTo(models.users);
    models.users.hasOne(models.user_profile);
    models.insights.findAll({
        include: [
            {
                model: models.insights_views,
                foreignkey: 'insight_id',
                attributes: ['id', 'insight_id'],
                required: true
            },
            {
                model: models.users,
                attributes: ['id', 'first_name', 'last_name'],
                include: [
                    {
                        model: models.user_profile,
                        attributes: ['userId', 'profile_pic'],
                    }
                ]
            }
        ],
        group: ['insight_id'],
        order: [[Sequelize.fn('count', Sequelize.col('insight_id')), 'desc']]
    }).then(trendingInsights => {
        let result = {};
        if (trendingInsights) {
            result.data = trendingInsights;
            result.success = true;
        } else {
            result.success = false;
        }
        return response.json(result);
    })
}

exports.NewInsights = (request, response) => {
    models.insights.belongsTo(models.users);
    models.users.hasOne(models.user_profile);
    models.user_profile.belongsTo(models.company_details, { foreignKey: 'company_id' });
    models.insights.hasOne(models.insights_views); 
    models.insights.hasOne(models.insight_comments); 
    models.insights.findAll({
        where: { 'status': 'published' },       
        include: [
            {
                model: models.users,
                attributes: ['id', 'first_name', 'last_name'],
                include: [
                    {
                        model: models.user_profile,
                        attributes: ['userId', 'profile_pic','company_id'],
                        include: [
                            {
                                model: models.company_details,
                                attributes: ['logo']                                
                            }
                        ]
                    }
                ]
            },
            {
                model: models.insights_views,
                attributes: [ [Sequelize.literal('(select count(`insight_id`) from insights_views  where insights.id = insights_views.insight_id)'),'viewCount']]                              
            },
            {
                model: models.insight_comments,
                attributes: [ [Sequelize.literal('(select count(`insightId`) from insight_comments  where insights.id = insight_comments.insightId)'),'commentCount']],
                required : false                                             
            }         
        ],
        group: ['id'],
        order: [["createdAt", "desc"]],
        limit: 10
    }).then(newInsights => {
        let result = {};
        if (newInsights) {
            result.data = newInsights;
            result.success = true;
        } else {
            result.success = false;
        }
        return response.json(result);
    })
}
exports.ResearchInsights = (request, response) => {
    models.insights.belongsTo(models.users); 
    models.users.hasOne(models.user_profile); 
    models.user_profile.belongsTo(models.company_details,{ foreignKey: 'company_id' }); 
    models.insights.hasOne(models.insights_views); 
    models.insights.hasOne(models.insight_comments);  
    models.insights.findAll({
        where:
        { 'status': config.INS_PUB,'macro_type': [config.INS_SEC_CUR,config.INS_SEC_IND,config.INS_SEC_ECO]},
        include: [
            {
                model: models.users,
                attributes: ['id', 'first_name', 'last_name'],
                include: [
                    {
                        model: models.user_profile,
                        attributes: ['userId', 'profile_pic'],
                        include: [
                            {
                                model: models.company_details,
                                attributes: ['logo'],
                            }
                        ]
                    }
                ]
            },
            {
                model: models.insights_views,
                attributes: [ [Sequelize.literal('(select count(`insight_id`) from insights_views  where insights.id = insights_views.insight_id)'),'viewCount']]                              
            },
            {
                model: models.insight_comments,
                attributes: [
                    
                    [Sequelize.literal('(select count(`insightId`) from insight_comments  where insights.id = insight_comments.insightId)'),'commentCount']
                ],                                        
            }           
        
        ],
        group: ['id'],
        order: [["createdAt", "desc"]],
        limit: 10
    }).then(currencyInsights => {
        let result = {};
        if (currencyInsights) {
            result.data = currencyInsights;
            result.success = true;
        } else {
            result.success = false;
        }
        return response.json(result);
    })
}

exports.Privillagelist = (request, response) => {
    models.privillages.findAll({
        where: { 'userId': request.body.currentUserId },
        attributes: ['id','userId', 'privillege'],
    }).then(myPrivillagelist => {
            let result = {};
            if (myPrivillagelist.length) {
                result.data = myPrivillagelist;
                result.success = true;
            } else {
                result.success = false;
            }
            return response.json(result);
    })
}


exports.MyWatchlist = (request, response) => {
    models.watch_lists.findAll({
        where: { 'userId': request.body.currentUserId },
        attributes: ['id', 'type_id', 'userId', 'type'],
    }).then(myWatchlist => {
        // MyWatchlistInsights(myWatchlist, insights => {
        //     let result = {};
        //     if (insights) {
        //         result.data = insights;
        //         result.success = true;
        //     } else {
        //         result.success = false;
        //     }
        //     return response.json(result);
        // });
        let result = {};
        if (myWatchlist) {
            result.data = myWatchlist;
            result.success = true;
        } else {
            result.success = false;
        }
        return response.json(result);
    })
}
MyWatchlistInsights = (watchList, cb) => {
    models.insights.belongsTo(models.users);
    models.users.hasOne(models.user_profile);
    where = [];
    instypeId = [];
    tictypeId = [];
    anatypeId = [];
    watchList.forEach(val => {
        if (val.type == 'insight') {
            instypeId.push(val.type_id)
            where.push({ 'id': { $in: instypeId } });
        } else if (val.type == 'ticker') {
            tictypeId.push(val.type_id)
            where.push({ 'tickerId': { $in: tictypeId } });
        } else if (val.type == 'analyst') {
            anatypeId.push(val.type_id)
            where.push({ 'createdBy': { $in: anatypeId } });
        }
    })
    models.insights.findAll({
        where: { $or: where },
        include: [
            {
                model: models.users,
                attributes: ['id', 'first_name', 'last_name'],
                include: [
                    {
                        model: models.user_profile,
                        attributes: ['userId', 'profile_pic'],
                    }
                ]
            }
        ],
    }).then(watchInsights => {
        cb(watchInsights);
    })
}