'use strict';
module.exports = (sequelize, DataTypes) => {
  var locker_types = sequelize.define('locker_types', {
    type: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return locker_types;
};