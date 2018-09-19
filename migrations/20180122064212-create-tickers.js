'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tickers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(60)
      },
      company: {
        type: Sequelize.STRING(100)
      },
      industry: {
        type: Sequelize.STRING(100)
      },
      sectorId: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'Sectors',
          key: 'id'
        }
      },
      companyId: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'Company_details',
          key: 'id'
        }
      },
      company_url: {
        type: Sequelize.STRING
      },
      company_logo: {
        type: Sequelize.STRING
      },
      countryId: {
        type: Sequelize.INTEGER,
		    onUpdate: 'CASCADE',
		    onDelete: 'RESTRICT',
        references: {
          model: 'Countries',
          key: 'id'
        }
      },
      currency: {
        type: Sequelize.STRING(30)
      },
      listing_exchange: {
        type: Sequelize.STRING(30)
      },
      market_cap: {
        type: Sequelize.FLOAT
      },
      share_in_issue: {
        type: Sequelize.FLOAT
      },
      fiftytwo_week_high: {
        type: Sequelize.FLOAT
      },
      fiftytwo_week_low: {
        type: Sequelize.FLOAT
      },
      avg_volume: {
        type: Sequelize.FLOAT
      },
      about: {
        type: Sequelize.STRING
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
      updatedBy: {
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
    return queryInterface.dropTable('Tickers');
  }
};