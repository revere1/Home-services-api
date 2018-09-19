'use strict';
module.exports = (sequelize, DataTypes) => {
  var banners = sequelize.define('banners', {
    banner: DataTypes.STRING,
    btype: DataTypes.INTEGER,
    btype_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return banners;
};