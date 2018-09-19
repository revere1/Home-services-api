'use strict';
module.exports = (sequelize, DataTypes) => {
  var Categories = sequelize.define('categories', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          Categories.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (categories, error) {
            if (error) {
              return next(error);
            }
            else if (categories) {
              if(categories && self.id !== categories.id)
              return next('Category already in use!');
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
          Categories.belongsTo(models.users, {
            foreignKey: 'created_on',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
          Categories.belongsTo(models.users, {
            foreignKey: 'updated_on',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
        }
      }
    });
  return Categories;
};