
'use strict';
module.exports = (sequelize, DataTypes) => {
  var insights = sequelize.define('insights', {
    type: DataTypes.STRING(20),
    commodityId: DataTypes.INTEGER,
    tickerId: DataTypes.INTEGER,
    macro_type: DataTypes.STRING(20),
    sectorId: DataTypes.INTEGER,
    subsectorId: DataTypes.INTEGER,
    regionId: DataTypes.INTEGER,
    currencyId: DataTypes.INTEGER,
    insight_img: DataTypes.STRING,
    headline: DataTypes.STRING,
    summary: DataTypes.TEXT,
    description: DataTypes.TEXT,
    bullbear: DataTypes.STRING(30),
    editorierId: DataTypes.INTEGER,
    //createdBy: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER,
      field: 'createdBy'
    },
    updatedBy: DataTypes.INTEGER,
    status: DataTypes.STRING(30)
  }, {
      //freezeTableName: true,
      classMethods: {
        associate: function (models) {
          insights.belongsTo(models.users, {
            foreignKey: 'createdBy',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          });
          insights.belongsTo(models.users, {
            foreignKey: 'editorierId',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          });
          insights.belongsTo(models.users, {
            foreignKey: 'updatedBy',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          });
          insights.belongsTo(models.commodities, {
            foreignKey: 'commodityId',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          });
          insights.belongsTo(models.tickers, {
            foreignKey: 'tickerId',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          });
          insights.belongsTo(models.sectors, {
            foreignKey: 'sectorId',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          });
          insights.belongsTo(models.subsectors, {
            foreignKey: 'subsectorId',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          });
        }
      }
    });
  insights.afterCreate(insight => {
    //Update Elastic search user    
    let esC = require('../controllers/elastic/EInsightsController');
    esC.createUpdateInsight(insight.id, result => {
      if (result.success) console.log('Ticker loaded into elastic server');
      else console.log(result.message);
    });
  });

  insights.afterUpdate(insight => {
    //Update Elastic search user
    let esC = require('../controllers/elastic/EInsightsController');
    esC.createUpdateInsight(insight.id, result => {
      if (result.success) console.log('Ticker loaded into elastic server');
      else console.log(result.message);
    });
    if (insight.status === "published") {
      postInTwitter(insight);
    }

  });

  insights.afterDestroy(instance => {
    let esC = require('../controllers/elastic/EInsightsController');
    esC.deleteInsight(instance.id, (res) => {
      console.log(res);
    });
  });

  // function postInFacebook(body, link){
  //   var FB = require('fb');
  //   FB.setAccessToken('EAACEdEose0cBAJjLjbUmgEgD0BzDxHJltFyLseyBX1mPoRURXNZCvhcbfD88H65l2hLxwbKhEAiyNwUN8Nq3p813opeboTaMFHwY0Ww3Nv0jSstXB5em6xDQwU0gZBaNf9qNcnDBe1QTAqpAntQZCcZB7ZBljeifZB87tK6MmLnS5sNvaDwdeq5nHZASobw1TNSBbuGf1NmpQZDZD');

  //   FB.api('me/feed', 'post', { message: body, link: link}, function (res) {
  //   if(!res || res.error) {
  //       console.log(!res ? 'error occurred' : res.error);
  //       return;
  //   }
  //   console.log('Post Id: ' + res.id);
  //   });
  // }

  function postInTwitter(insight) {
    var models = require('../models');
    var config = require('../config/config.json')['system'];
    models.users.findOne({ where: { id: insight.userId }, attributes: ['first_name', 'last_name'] })
      .then(user => {
        var Twit = require('twit');
        var tconfig = require('./../config/twitterconfig');
        var utils = require('./../helpers/utils');

        /***********Start - twitter configurations ********/

        var T = new Twit(tconfig);
        let txt = insight.headline;
        txt += '\n @' + user.first_name + '-' + user.last_name + ' \n';
        let link = config.frontend_url + 'insights/preview/' + insight.id;
        // postInFacebook(txt, link);
        postInLinkedin(txt, link, insight);
        txt += link;
        var tweet = {
          status: txt
        }
        T.post('statuses/update', tweet, tweeted);
        function tweeted(err, data, response) {
          if (err) {
            console.log("Something went wrong!");
            console.log(err)
          }
          else {
            console.log("Voila It worked!");
          }
        }
        /***********End - twitter configurations ********/
      });
  };

  function postInLinkedin(txt, link, insight) {
    var models = require('../models');
    var Linkedin = require('node-linked-in');
    var utils = require('../helpers/utils');
    var config = require('../config/config.json')['system'];
    var cfg = {};
    var linkedin = new Linkedin(cfg);
    models.settings.findOne({ where: { social: 'linkedin'}, attributes: ['access_token'] }).then(settings => {
    let atoken =settings.access_token;
    console.log(settings)
    linkedin.authenticate({
      token: atoken //access token
    });
    let images =  config.frontend_url + insight.insight_img ;
    let img = config.frontend_url+'assets/img/revere-logo.png';
    if (images) {
      img = images[0];
    }
    else {
      let descImage = utils.extractImgs(insight.description);
      if (descImage) {
        img = descImage[0];
      }
    }
    // utils.extractImgs(insight.summary);
    linkedin.shares.add({
    "data": {
      'comment': txt,
      "visibility": { 'code': 'anyone' },
      "content": {
        "submitted-url": link,

        "submitted-image-url": img,
        "title": insight.headline,
        "description": insight.headline
      }
    }
    },
    function (err, response) {
      console.log(response);
      // return res.json(err);
    });

});




   
  }


  return insights;
};

