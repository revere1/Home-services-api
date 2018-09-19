'use strict';
module.exports = (sequelize, DataTypes) => {
  var insights_views = sequelize.define('insights_views', {
    insightId: {
      type: DataTypes.INTEGER,
      field: 'insight_id'
    },
    viewedBy: DataTypes.INTEGER
  }, {
      classMethods: {
        // freezeTableName: true,
        // underscored: true,
        // associate: function(models) {
        //   insights_views.belongsTo(models.insights, {
        //     foreignKey: 'insight_id',
        //     onUpdate: 'CASCADE',
        //     onDelete: 'CASCADE'
        //   });
        //   insights_views.belongsTo(models.users, {
        //     foreignKey: 'viewedBy',
        //     onUpdate: 'CASCADE',
        //     onDelete: 'CASCADE'
        //   });
        // }
      }
    });
  return insights_views;
};