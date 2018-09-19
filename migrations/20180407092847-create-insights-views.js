'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('insights_views', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      insight_id: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'NO ACTION',
        references: {
          model: 'insights',
          key: 'id'
        }
      },
      viewedBy: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'NO ACTION',
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
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
    return queryInterface.dropTable('insights_views');
  }
};