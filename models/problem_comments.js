'use strict';
module.exports = (sequelize, DataTypes) => {
  var problem_comments = sequelize.define('problem_comments', {
    problemId: DataTypes.INTEGER,
    msgTo: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    is_read: DataTypes.BOOLEAN,
    parentId: DataTypes.INTEGER,
    createdBy: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        problem_comments.belongsTo(models.users, {
          foreignKey: 'createdBy',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        problem_comments.belongsTo(models.users, {
          foreignKey: 'msgTo',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
        problem_comments.belongsTo(models.problems, {
          foreignKey: 'problemId',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
        problem_comments.belongsTo(models.problem_comments, {
          foreignKey: 'parentId',
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION'
        });
      }
    }
  });
  return problem_comments;
};