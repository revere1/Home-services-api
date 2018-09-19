'use strict';
module.exports = (sequelize, DataTypes) => {
  var Company_details = sequelize.define('company_details', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          Company_details.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (company_details, error) {
            if (error) {
              return next(error);
            }
            else if (company_details) {
              if(company_details && self.id !== company_details.id){
                return next('Company already in use!');
              }
            }
            next();
          });
        }
      }
    },
    website: DataTypes.STRING,
    about: DataTypes.STRING,
    logo: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  },
    {
      classMethods: {
        associate: function (models) {
          Company_details.belongsTo(models.users, {
            foreignKey: 'createdBy',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
          Company_details.belongsTo(models.users, {
            foreignKey: 'updatedBy',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
        }
      }
    });
  return Company_details;
};