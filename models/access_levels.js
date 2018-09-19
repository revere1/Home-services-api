'use strict';
module.exports = (sequelize, DataTypes) => {
  var Access_Levels = sequelize.define('access_levels', {
    name: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // Access_Levels.hasMany(models.users, {
        //   foreignKey: 'id'
        // });
        // associations can be defined here
      }
    }
  });
  return Access_Levels;
};