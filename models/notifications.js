'use strict';
module.exports = (sequelize, DataTypes) => {
  var notifications = sequelize.define('notifications', {
    message: DataTypes.STRING,
    from: DataTypes.INTEGER,
    to: DataTypes.INTEGER,
    type: DataTypes.STRING(60), 
    is_read: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        notifications.belongsTo(models.users, {
          foreignKey: 'from',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        notifications.belongsTo(models.users, {
          foreignKey: 'to',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return notifications;
};