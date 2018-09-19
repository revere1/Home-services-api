'use strict';
module.exports = (sequelize, DataTypes) => {
  var analysts_followers = sequelize.define('analysts_followers', {
    analyst_id: DataTypes.INTEGER,
    followedBy: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return analysts_followers;
};