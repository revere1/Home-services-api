'use strict';
module.exports = (sequelize, DataTypes) => {
  var privillages = sequelize.define('privillages', {
    userId: DataTypes.INTEGER,
    privillege: DataTypes.STRING,
    updated_by: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return privillages;
};