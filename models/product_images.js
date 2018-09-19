'use strict';
module.exports = (sequelize, DataTypes) => {
  var product_images = sequelize.define('product_images', {
    mime_type: DataTypes.STRING,
    path: DataTypes.STRING,
    productId: DataTypes.INTEGER,
    orgName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
          product_images.belongsTo(models.products, {
          foreignKey: 'productId',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return product_images;
};