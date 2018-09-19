'use strict';
module.exports = (sequelize, DataTypes) => {
  var rating = sequelize.define('rating', {
    insightId: DataTypes.INTEGER,
    userId:DataTypes.INTEGER,
    rating:DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return rating;
};