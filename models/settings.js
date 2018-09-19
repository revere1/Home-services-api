'use strict';
module.exports = (sequelize, DataTypes) => {
  var settings = sequelize.define('settings', {
    social: DataTypes.STRING,
    access_token: DataTypes.TEXT,
    expires_at: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return settings;
};