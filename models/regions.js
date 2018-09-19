'use strict';
module.exports = (sequelize, DataTypes) => {
  var regions = sequelize.define('regions', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          regions.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (regions, error) {
            if (error) {
              return next(error);
            }
            else if (regions) {
              if(regions && self.id !== regions.id){
                return next('Region already Existed!');
              }
            }
            next();
          });
        }
      }
    }
  }, {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
        }
      }
    });
  return regions;
};