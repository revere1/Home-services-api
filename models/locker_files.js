'use strict';
module.exports = (sequelize, DataTypes) => {
  var locker_files = sequelize.define('locker_files', {
    mime_type: DataTypes.STRING,
    path: DataTypes.STRING,
    lockerId: DataTypes.INTEGER,
    orgName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        locker_files.belongsTo(models.locker, {
          foreignKey: 'lockerId',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return locker_files;
};