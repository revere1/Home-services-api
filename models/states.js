'use strict';
module.exports = (sequelize, DataTypes) => {
  var States = sequelize.define('states', {
    country_id: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          States.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (states, error) {
            if (error) {
              return next(error);
            }
            else if (states) {
              if(states && self.id !== states.id)
              return next('State already in use!');
            }
            next();
          });
        }
      }
    },
    status: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        States.belongsTo(models.countries, {
          foreignKey: 'country_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
        States.belongsTo(models.users, {
          foreignKey: 'createdBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        States.belongsTo(models.users, {
          foreignKey: 'updatedBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
      }
    }
  });
  return States;
};