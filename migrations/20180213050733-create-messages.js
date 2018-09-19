'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sent_from: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      subject: {
        type: Sequelize.TEXT
      },
      message: {
        type: Sequelize.TEXT
      },
      parent: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'CASCADE',
        references: {
          model: 'messages',
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
    return queryInterface.dropTable('messages');
  }
};