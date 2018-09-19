'use strict';
module.exports = (sequelize, DataTypes) => {
  var products = sequelize.define('products', {
    category_id: DataTypes.INTEGER,
    subcategory_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    product_code: DataTypes.STRING,
    product_description: DataTypes.STRING,
    product_img: DataTypes.STRING,
    cost: DataTypes.STRING,
    offer_price:DataTypes.STRING,
    delivery_days:DataTypes.STRING,
    quantity: DataTypes.STRING,
    status: DataTypes.STRING
  },  {
    classMethods: {
      associate: function(models) {
        products.belongsTo(models.category, {
          foreignKey: 'category_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
        products.belongsTo(models.subcategory, {
          foreignKey: 'subcategory_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
      }
    }
  });
  return products;
};