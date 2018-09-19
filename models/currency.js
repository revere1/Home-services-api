'use strict';
module.exports = (sequelize, DataTypes) => {
  var currency = sequelize.define('currency', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUnique: function (value, next) {
          var self = this;
          currency.find({
            where: { name: value },
            attributes: ['id']
          }).done(function (currency, error) {
            if (error) {
              return next(error);
            }
            else if (currency) {
              if (currency && self.id !== currency.id)
                return next('Currency already in use!');
            }
            next();
          });
        }
      }
    },
    country: DataTypes.STRING
  }, {
      freezeTableName: true,
      classMethods: {
        associate: function (models) {
          // associations can be defined here
        }
      }
    });
  return currency;
};