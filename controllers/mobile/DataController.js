var models = require('../../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var utils = require('./../../helpers/utils');
var multer = require('multer')
var async = require('async');
var fs = require('fs');
var db = require('./../../models/index');

exports.getCountries = function(req,res){
    models.countries.findAll({
        where:{
            status:'active'
        }
    }).then(countries=>{
        if(countries){
            res.json({success:true,countries:countries});
        }else{
            res.json({success:false,message:"Something went wrong,Please try again"});
        }
    }).catch(function (err) {
       return response.json({success:false,message:err.message});
    });
};
exports.getStates = function(req,res){
    
    let country_id = req.body.country_id;
    
    if(country_id != '')
    {
        
        models.states.findAll({
            where:{
                    country_id:country_id,
                    status : 'active'
            }
        }).then(states=>{
            
            if(states){
                res.json({success:true,states:states});
            }else{
                res.json({success:false,message:"Something went wrong,Please try again"});
            }
        }).catch(function (err) {
            return res.json({success:false,message:err.message});
         });
    }else
    {
        res.json({success:false,message:'Invalid request,country id missing'});
    }
}