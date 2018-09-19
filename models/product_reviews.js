'use strict';
module.exports = (sequelize, DataTypes) => {
  var product_reviews = sequelize.define('product_reviews', {
    pid: DataTypes.INTEGER,
    uid: DataTypes.INTEGER,
    review: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return product_reviews;
};