var models = require('../../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var utils = require('./../../helpers/utils');
var multer = require('multer')
var async = require('async');
var fs = require('fs');
var db = require('./../../models/index');
var validate = require('../../node_modules/validator');

exports.GetCategories = (req,res)=>
{
    models.category.findAll({
        where: {
            status: 'active'
        }        
    }).then(function (categories) {
        if (!categories) {
            res.status(201).json({ success: false, message: 'No categories available' });
        } else if (categories) {
            res.status(201).json({
                success: true,
                data: categories
            });
        }
    });
}

exports.GetSubCategories = (req,res)=>
{
    models.subcategories.findOne({
        where: {
            $and : [
                    {category_id: req.params.cat_id},
                    {status: 'active'}
                ]            
        }        
    }).then(function (subcategories) {
        if (!subcategories) {
            res.status(201).json({ success: false, message: 'No sub categories available' });
        } else if (subcategories) {
            res.status(201).json({
                success: true,
                data: subcategories
            });
        }
    });
}

exports.GetProductsByCat = (req,res)=>
{
   models.products.findAll({
        where: {
            $and : [
                    {category_id: req.params.cat_id},                   
                    {status: 'active'}
                ]            
        }        
    }).then(function (products) {
    
        if (!products) {
            res.status(201).json({ success: false, message: 'No products available' });
        } else if (products) {
            res.status(201).json({
                success: true,
                data: products
            });
        }
    });
}
exports.GetProductsBySubCat = (req,res)=>
{
    models.products.findAll({
        where: {
            $and : [
                    {category_id: req.params.cat_id},
                    {subcategory_id: req.params.scat_id},
                    {status: 'active'}
                ]            
        }        
    }).then(function (products) {
        if (!products) {
            res.status(201).json({ success: false, message: 'No products available' });
        } else if (products) {
            res.status(201).json({
                success: true,
                data: products
            });
        }
    });
}
exports.GetProductDetails = (req,res)=>
{
    models.product_reviews.belongsTo(models.mobile_users, { foreignKey: 'uid' });
    models.products.findOne({
        where: {
            $and : [
                    {id: req.params.pid},
                    {status: 'active'}
                ]            
        }        
    }).then(function (product) {       

        if (!product) {
            res.status(201).json({ success: false, message: 'Products details not available' });
        } else if (product) {
        
        models.product_reviews.findAll({
                where: {
                    $and : [
                            {pid: product.id},
                            {status: 1}
                        ]            
                },
                include:[
                {
                    model:models.mobile_users,
                    attributes:['user_name']

                }
                ]        
            }).then(function (previews){


                if (previews)
                {                    
                    models.product_images.findAll({
                        where:{
                            productId:product.id
                        }
                    }).then(function(pimages){

                        if(pimages)
                        {
                            res.status(201).json({
                                success: true,
                                data: {product:product,reviews:previews,images:pimages}
                            });
                        }
                        else
                        {
                            res.status(201).json({
                                success: true,
                                data: {product:product,reviews:previews,images:''}
                            });
                        }

                    });
                  
                }else{
                    res.status(201).json({
                        success: true,
                        data: {product:product,reviews:'',images:''}
                    });
                }
                
            });           
        }
    });  
}
 
exports.submitProdReview = (req,res) =>
{
    let pid = req.body.pid;
    let uid = req.body.uid;
    let review = req.body.review;
    let rerr = [];
    if(pid == '' || isNaN(pid)){
        rerr.push('Invalid product id');
    }
    if(uid == '' || isNaN(uid)){
        rerr.push('Invalid user id');
    }
    if(review == '')
    {
        rerr.push('Review should not be empty');
    }
    if(rerr.length == 0){
        models.product_reviews.create({pid:pid,uid:uid,review:review,status:1}).then(review=>{
            if(review){
                res.json({success:true,message:"Review submitted successfully"});
            }else{
                res.json({success:false,message:"Submitting review failed.Try again"});

            }
        });

    }else{
        res.json({success:false,errs:rerr});
    }
}

