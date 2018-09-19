'use strict';
module.exports = (sequelize, DataTypes) => {
  var watch_list = sequelize.define('watch_lists', {
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    type_id: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return watch_list;
};