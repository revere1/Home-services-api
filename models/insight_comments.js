'use strict';
module.exports = (sequelize, DataTypes) => {
  var insight_comments = sequelize.define('insight_comments', {
    insightId: DataTypes.INTEGER,
    from: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    is_read: DataTypes.BOOLEAN,
    parent: DataTypes.INTEGER
   
  }, {
    classMethods: {
      associate: function(models) {
     
        insight_comments.belongsTo(models.users, {
          foreignKey: 'from',
          onUpdate: 'CASCADE'
        });
        insight_comments.belongsTo(models.insights, {
          foreignKey: 'insightId',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        insight_comments.belongsTo(models.insight_comments, {
          foreignKey: 'parent',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return insight_comments;
};