'use strict';
module.exports = (sequelize, DataTypes) => {
  var insight_comment_attachements = sequelize.define('insight_comment_attachements', {
    mime_type: DataTypes.STRING,
    path: DataTypes.STRING,
    insightcommentId: DataTypes.INTEGER,
    orgName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        insight_comment_attachements.belongsTo(models.insight_comments, {
          foreignKey: 'insightcommentId',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return insight_comment_attachements;
};