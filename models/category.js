'use strict';
module.exports = (sequelize, DataTypes) => {
  var category = sequelize.define('category', {
    category_name: DataTypes.STRING,
    category_desc: DataTypes.STRING,
    path: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return category;
};