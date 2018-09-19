'use strict';
module.exports = (sequelize, DataTypes) => {
  var locker = sequelize.define('locker', {
    typeId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    note: DataTypes.TEXT,
    url: DataTypes.TEXT,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        locker.belongsTo(models.users, {
          foreignKey: 'createdBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        locker.belongsTo(models.users, {
          foreignKey: 'updatedBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        locker.belongsTo(models.locker_types, {
          foreignKey: 'typeId',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
      }
    }
  });
  return locker;
};