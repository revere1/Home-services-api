'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('problem_comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      problemId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'problems',
          key: 'id'
        },
        allowNull: false
      },
      msgTo: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'No Action',
        references: {
          model: 'users',
          key: 'id'
        }
      },      
      message: {
        type: Sequelize.TEXT
      },
      is_read: {
        type: Sequelize.BOOLEAN
      },
      parentId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'NO ACTION',
        references: {
          model: 'problem_comments',
          key: 'id'
        }
      },
      createdBy: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'NO ACTION',
        references: {
          model: 'users',
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
    return queryInterface.dropTable('problem_comments');
  }
};