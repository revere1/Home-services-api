'use strict';
module.exports = (sequelize, DataTypes) => {
  var Subsectors = sequelize.define('subsectors', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          Subsectors.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (subsectors, error) {
            if (error) {
              return next(error);
            }
            else if (subsectors) {
              if(subsectors && self.id !== subsectors.id)
              return next('Subsector already in use!');
            }
            next();
          });
        }
      }
    },
    sector_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Subsectors.belongsTo(models.Sectors, {
          foreignKey: 'sector_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
        Subsectors.belongsTo(models.users, {
          foreignKey: 'createdBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        Subsectors.belongsTo(models.users, {
          foreignKey: 'updatedBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
      }
    }
  });
  return Subsectors;
};