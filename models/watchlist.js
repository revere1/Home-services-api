'use strict';
module.exports = (sequelize, DataTypes) => {
  var watchlist = sequelize.define('watchlist', {
    uid: DataTypes.INTEGER,
    pid: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return watchlist;
};