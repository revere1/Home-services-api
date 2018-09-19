'use strict';
module.exports = (sequelize, DataTypes) => {
  var lockers = sequelize.define('lockers', {
    typeId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    note: DataTypes.TEXT,
    url: DataTypes.TEXT,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        locker_types.belongsTo(models.users, {
          foreignKey: 'createdBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        lockers.belongsTo(models.users, {
          foreignKey: 'updatedBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        lockers.belongsTo(models.locker_types, {
          foreignKey: 'typeId',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
      }
    }
  });
  return lockers;
};