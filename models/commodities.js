'use strict';
module.exports = (sequelize, DataTypes) => {
  var commodities = sequelize.define('commodities', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          commodities.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (commodities, error) {
              if (error) {
                return next(error);
              }
              else if (commodities) {
                if(commodities && self.id !== commodities.id) {
                  return next('Commodity already in use!');
                }
              }
              next();
            });
        }
      }
    },
    createdBy: DataTypes.INTEGER
  }, {
      classMethods: {
        associate: function (models) {
          commodities.belongsTo(models.users, {
            foreignKey: 'createdBy',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
        }
      }
    });
  return commodities;
};