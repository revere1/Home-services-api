'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('product_images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mime_type: {
        type: Sequelize.STRING
      },
      path: {
        type: Sequelize.STRING
      },
      productId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'CASCADE',
        references: {
          model: 'products',
          key: 'id'
        },
        allowNull: false
      },
      orgName: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('product_images');
  }
};