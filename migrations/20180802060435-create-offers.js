'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('offers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      offer_name:{
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.STRING
      },
      offer_code: {
        type: Sequelize.STRING
      },
      discount_type: {
        type: Sequelize.STRING
      },
      discount_value: {
        type: Sequelize.STRING
      },
      limit: {
        type: Sequelize.STRING
      },
      limit_value: {
        type: Sequelize.STRING
      },
      offer_img: {
        type: Sequelize.STRING
      },
      status: {
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
    return queryInterface.dropTable('offers');
  }
};