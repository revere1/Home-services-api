'use strict';
module.exports = (sequelize, DataTypes) => {
  var user_profile = sequelize.define('user_profile', {
    userId: DataTypes.INTEGER,
    company_url: DataTypes.STRING,
    company_logo: DataTypes.STRING,
    company_name: DataTypes.STRING,
    company_details_id: { 
      type:DataTypes.INTEGER,
      field: 'company_id'

    },
    sector_id: DataTypes.INTEGER,
    subsector_id: DataTypes.INTEGER,    
    country_id: DataTypes.INTEGER,
    state_id: DataTypes.INTEGER,
    city: DataTypes.STRING,
    zip_code: DataTypes.STRING,
    profile_pic: DataTypes.STRING,
    about: DataTypes.STRING
  }, {
    freezeTableName: true,
    underscored: true,
    timestamps: false,
    classMethods: {
      associate: function(models) {        
        user_profile.belongsTo(models.users, {
          foreignKey: 'userId',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        user_profile.belongsTo(models.Company_details, {
          foreignKey: 'company_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
        user_profile.belongsTo(models.Sectors, {
          foreignKey: 'sector_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
        user_profile.belongsTo(models.Subsectors, {
          foreignKey: 'subsector_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
        user_profile.belongsTo(models.Countries, {
          foreignKey: 'country_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });		
        user_profile.belongsTo(models.States, {
          foreignKey: 'state_id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
      }
    }
  });
  user_profile.afterUpdate(userp => {
    //Update Elastic search user
    let esC = require('../controllers/elastic/EUserController');
    esC.createUpdateUser(userp.userId,result=>{
      if(result.success)console.log('user loaded into elastic server');
      else console.log(result.message);
    });
  });

  
  return user_profile;
};