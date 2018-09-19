'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING(60)
      },
      last_name: {
        type: Sequelize.STRING(60)
      },
      email: {
        type: Sequelize.STRING(100)
      },
      contact_number: {
        type: Sequelize.STRING(20)
      },
      password_hash: {
        type: Sequelize.STRING(120)
      },
      password_reset_token: {
        type: Sequelize.STRING(120)
      },
      status: {
        type: Sequelize.STRING(30)
      },
      access_level: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'Access_Levels',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
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
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'NO ACTION',
        references: {
          model: 'users',
          key: 'id'
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};