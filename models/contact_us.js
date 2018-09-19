'use strict';
module.exports = (sequelize, DataTypes) => {
  var contact_us = sequelize.define('contact_us', {
    name: DataTypes.STRING,
    mobile: DataTypes.INTEGER,
    email: DataTypes.STRING,
    comments: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return contact_us;
};