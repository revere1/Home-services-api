'use strict';
module.exports = (sequelize, DataTypes) => {
  var insight_attachements = sequelize.define('insight_attachements', {
    mime_type: DataTypes.STRING,
    path: DataTypes.STRING,
    insightId: DataTypes.INTEGER,
    orgName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        insight_attachements.belongsTo(models.insights, {
          foreignKey: 'insightId',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return insight_attachements;
};