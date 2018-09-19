var models = require('../../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.addToWl = function(req,res){

    let uid = req.body.uid;
    let pid = req.body.pid;
    let wlerrs = [];

    if(isNaN(uid)){
        cerrs.push('Invalid user id');
    }
    if(isNaN(pid)){
        cerrs.push('Invalid product id');
    }
   

    if(wlerrs.length > 0){
        res.json({success:false,wlrrors:wlerrs});
    }else{
        models.watchlist.create({
            pid:pid,
            uid:uid
        }).then(function(watchlist){

            if(watchlist){
                res.json({
                    success:true,
                    message:"Product succefully added to watchlist"
                });
            }else{
                res.json({
                    success:false,
                    message:"Adding product to watchlist failed. Please try again"
                });
            }

        });
    }

}
exports.removeFromWl = function(req,res){
    let wlid = req.body.cid;
    if(isNaN(wlid))
    {
        res.json({
            success:false,
            message:"Invalid id"
        });    
    }
    else
    {
        models.watchlist.destroy({
            where:{
                id:wlid
            }
        }).then(function(status){
            if(status)
            {
                res.json({
                    success:true,
                    message:"Product successfully removed from watchlist"
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
exports.getWatchList = function(req,res){
    let uid = req.body.uid;
    if(isNaN(uid)){
        res.json({success:false,message:'Something went wrong.Try again'});
    }
    else
    {
    models.watchlist.hasOne(models.products,{ foreignKey: 'pid' });
    models.watchlist.findAll({where:{uid:uid}}).then(function(watchlist){
        if(watchlist)
        {
            res.json({success:true,watchlist:watchlist});
        }
        else
        {
            res.json({success:false,message:'Something went wrong.Try again'});
        }
     });
    }
}