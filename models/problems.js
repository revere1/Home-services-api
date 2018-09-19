'use strict';
module.exports = (sequelize, DataTypes) => {
  var problems = sequelize.define('problems', {
    subject: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER,
    resolvedBy: DataTypes.INTEGER,
    resolved_date: DataTypes.DATE,
    is_read: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        problems.belongsTo(models.users, {
          foreignKey: 'createdBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        problems.belongsTo(models.users, {
          foreignKey: 'updatedBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        problems.belongsTo(models.users, {
          foreignKey: 'resolvedBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });        
      }
    }
  });
  return problems;
};