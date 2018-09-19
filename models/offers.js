'use strict';
module.exports = (sequelize, DataTypes) => {
  var offers = sequelize.define('offers', {
    offer_name:DataTypes.STRING,
    desc: DataTypes.STRING,
    offer_code: DataTypes.STRING,
    discount_type: DataTypes.STRING,
    discount_value: DataTypes.STRING,
    limit: DataTypes.STRING,
    limit_value: DataTypes.STRING,
    offer_img: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return offers;
};