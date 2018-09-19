'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('insights', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      commodityId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'commodities',
          key: 'id'
        }
      },
      tickerId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'tickers',
          key: 'id'
        }
      },
      macro_type:{
        type: Sequelize.STRING(60)
      },
      sectorId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'sectors',
          key: 'id'
        }
      },
      subsectorId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'subsectors',
          key: 'id'
        }
      },
      regionId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'regions',
          key: 'id'
        }
      },
      currencyId:{
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'currency',
          key: 'id'
        }
      },
      macro_type: {
        type: Sequelize.STRING
      },
      sectorId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'sectors',
          key: 'id'
        }
      },
      subsectorId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'subsectors',
          key: 'id'
        }
      },
      region: {
        type: Sequelize.STRING(60)
      },
      currency: {
        type: Sequelize.STRING(30)
      },
      insight_img: {
        type: Sequelize.STRING
      },
      headline: {
        type: Sequelize.STRING
      },
      summary: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      bullbear: {
        type: Sequelize.STRING
      },
      editorierId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'users',
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
        },
        allowNull: false
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
		    onDelete: 'NO ACTION',
        references: {
          model: 'users',
          key: 'id'
        }
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
    return queryInterface.dropTable('insights');
  }
};