'use strict';
module.exports = (sequelize, DataTypes) => {
  var org_copies = sequelize.define('org_copies', {
    type: DataTypes.STRING,
    type_id: DataTypes.INTEGER,
    data: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return org_copies;
};