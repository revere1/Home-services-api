'use strict';
module.exports = (sequelize, DataTypes) => {
  var problem_files = sequelize.define('problem_files', {
    problemId: DataTypes.INTEGER,
    path: DataTypes.STRING,
    orgName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        problem_files.belongsTo(models.problems, {
          foreignKey: 'problemId',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
      }
    }
  });
  return problem_files;
};