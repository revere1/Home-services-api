'use strict';
module.exports = (sequelize, DataTypes) => {
  var subcategory = sequelize.define('subcategory', {
    category_id: DataTypes.INTEGER,
    subcategory_name: DataTypes.STRING,
    subcategory_desc: DataTypes.STRING,
    path: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        subcategory .belongsTo(models.category, {
          foreignKey: 'category_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
       
    
      }
    }
  });
  return subcategory;
};