'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_profile', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      company_url: {
        type: Sequelize.STRING
      },
      company_logo: {
        type: Sequelize.STRING
      },
      company_name: {
        type: Sequelize.STRING(100)
      },      
      sector_id: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'Sectors',
          key: 'id'
        }
      },
      subsector_id: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'Subsectors',
          key: 'id'
        }
      },
      country_id: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'Countries',
          key: 'id'
        }
      },
      state_id: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'States',
          key: 'id'
        }
      },
      city: {
        type: Sequelize.STRING(100)
      },
      zip_code: {
        type: Sequelize.STRING(20)
      },
      profile_pic:{
        type: Sequelize.STRING
      },
      about:{
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
    return queryInterface.dropTable('user_profile');
  }
};