'use strict';
module.exports = (sequelize, DataTypes) => {
  var Countries = sequelize.define('countries', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var slef = this;
          Countries.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (countries, error) {
            if (error) {
              return next(error);
            }
            else if (countries) {
              if(countries && self.id !== countries.id){
                return next('Country already in use!');
              }              
            }
            next();
          });
        }
      }
    },
    status: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  }, {
      classMethods: {
        associate: function (models) {
          Countries.belongsTo(models.users, {
            foreignKey: 'createdBy',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
          Countries.belongsTo(models.users, {
            foreignKey: 'updatedBy',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
        }
      }
    });
  return Countries;
};