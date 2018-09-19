'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('insight_comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      insightId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'CASCADE',
        references: {
          model: 'insights',
          key: 'id'
        },
        allowNull: false
      },
      from: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        references: {
          model: 'users',
          key: 'id'
        }
      },      
      comment: {
        type: Sequelize.TEXT
      },
      is_read: {
        type: Sequelize.BOOLEAN
      },
      parent: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'CASCADE',
        references: {
          model: 'insight_comments',
          key: 'id'
        }
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
    return queryInterface.dropTable('insight_comments');
  }
};