var models = require('../../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.addToCart = function(req,res){
    let uid = req.body.uid;
    let pid = req.body.pid;
    let opr = req.body.opr;
    let cerrs = [];

    if(isNaN(uid)){
        cerrs.push('Invalid user id');
    }
    if(isNaN(pid)){
        cerrs.push('Invalid product id');
    }
    if(opr != 'add' && opr != 'sub'){
        cerrs.push('Invalid cart operation');
    }

    if(cerrs.length > 0){
        res.json({success:false,cerrors:cerrs});
    }else{

        models.cart.findOne({
            where:{
                pid:pid,
                uid:uid
            }
        }).then(function(exist){
            let smsg = '';
           if(exist){
               let pcount = exist.pcount;
               if(opr == 'add')
               {
                   pcount = pcount + 1;
                   smsg = "Product succefully added to cart";
               }
               if(opr == 'sub')
               {
                   pcount = pcount - 1;
                   smsg = "Product succefully removed from cart";
               }

               models.products.findOne({where:{id:pid}}).then(function(products){
                    if(pcount > products.quantity){
                        res.json({success:false,message:products.quantity+' items only available'});
                    }else{
                        exist.updateAttributes({
                            pcount: pcount
                         }).then(function(cart){        
                             if(cart)
                             {
                                 res.json({
                                     success:true,
                                     message:smsg
                                 });
                             }
                             else
                             {
                                 res.json({
                                     success:false,
                                     message:"Something went wrong. Please try again"
                                 });
                             }
                 
                         });
                    }
               });

               
            }else{
                models.cart.create({
                    pid:pid,
                    uid:uid,
                    pcount:1
                }).then(function(cart){
        
                    if(cart)
                    {
                        res.json({
                            success:true,
                            message:"Product succefully added to cart"
                        });
                    }
                    else
                    {
                        res.json({
                            success:false,
                            message:"Adding product to cart failed. Please try again"
                        });
                    }
        
                });
            }

            
        });
    }
}
exports.removeFromCart = function(req,res){
let cid = req.body.cid;
    if(isNaN(cid))
    {
        res.json({
            success:false,
            message:"Invalid id"
        });    
    }
    else
    {
        models.cart.destroy({
            where:{
                id:cid
            }
        }).then(function(status){
            if(status)
            {
                res.json({
                    success:true,
                    message:"Product successfully removed from cart"
                });    
            }
            else
            {
                res.json({
                    success:false,
                    message:"Product not removed.Please try again"
                });    
            }

        })
    }
}
exports.getCart = function(req,res)
{
    let uid = req.body.uid;
    if(isNaN(uid)){
        res.json({success:false,message:'Something went wrong.Try again'});
    }
    else
    {
    models.cart.belongsTo(models.products,{ foreignKey: 'pid' });
    models.cart.findAll({where:{uid:uid},include:[{model:models.products,attributes:['id','product_img','cost','product_name']}]}).then(function(cartitems){
        if(cartitems)
        {
            models.mobile_user_address.findOne({where:{user_id:uid,default_address:1}}).then(default_addr=>{
                if(default_addr){
                res.json({success:true,cartitems:cartitems,default_addr:default_addr});
                }else{
                    res.json({success:true,cartitems:cartitems,default_addr:''});
                }
            });
        }
        else
        {
            res.json({success:false,message:'Something went wrong.Try again'});
        }
     });
    }
}
exports.getCartCount = function(req,res){
   
let uid = req.body.uid;
console.log(uid);
if(isNaN(uid)){
    res.json({success:false,message:'Invalid user id'});
}else{
    models.cart.count({where:{uid:uid}}).then(function(count){
        if(count)
        {
            res.json({success:true,count:count});
        }
        else{
            res.json({success:false,count:0});
        }
    });
}
}