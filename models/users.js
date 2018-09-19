'use strict';
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/config.json')['system'];

module.exports = function (sequelize, DataTypes) {
  var users = sequelize.define('users', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        len: {
          args: [6, 120],
          msg: "Email address must be between 6 and 120 characters in length"
        },
        isEmail: {
          msg: "Email address must be valid"
        },
        isUnique: function (value, next) {
          var self = this;
          users.find({
            where: { email: value },
            attributes: ['id']
          }).done(function (user, error) {
            if (error) {
              return next(error);
            }
            else if (user) {
              if (user && self.email !== user.email) {
                return next('Email address already in use!');
              }
            }
            next();
          });
        }
      }
    },
    contact_number: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    password_reset_token: DataTypes.STRING,
    status: DataTypes.STRING,
    access_level: DataTypes.INTEGER,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER
  }, {
      classMethods: {
        associate: function (models) {
          // models.users.belongsTo(models.users,{
          //   //through: models.users,
          //   as: 'superior',                                            
          //   foreignKey: "createdBy"                                            
          // });
          /*users.belongsTo(models.Access_Levels, {
            foreignKey: 'access_level',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          });
          users.belongsTo(models.users, {          
            foreignKey: 'createdBy',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });
          users.belongsTo(models.users, {
            foreignKey: 'updatedBy',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
          });*/
          //users.hasOne(models.user_profile);
        }
      },
      instanceMethods: {
        comparePassword: function (candidatePassword, cb) {
          console.log(this);
          bcrypt.compare(candidatePassword, this.password_hash, function (err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
          });
        },
        generateHash: function (password) {
          return bcrypt.hashSync(password, bcrypt.genSaltSync(config.salt), null);
        },
        validPassword: function (password, user) {
          return bcrypt.compareSync(password, user.password_hash)
        },
        getFullname: function () {
          return [this.firstname, this.lastname].join(' ');
        }
      }
    });

  users.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(config.salt), null);
  }

  users.afterUpdate(user => {
    //Update Elastic search user    
    let esC = require('../controllers/elastic/EUserController');
    esC.createUpdateUser(user.id, result => {
      if (result.success) console.log('user loaded into elastic server');
      else console.log(result.message);
    });
  });

  users.afterCreate(user => {
    //Update Elastic search user    
    let esC = require('../controllers/elastic/EUserController');
    esC.createUpdateUser(user.id, result => {
      if (result.success) console.log('user loaded into elastic server');
      else console.log(result.message);
    });
  });

  users.afterDestroy(instance => {
    let esC = require('../controllers/elastic/EUserController');
    console.log(instance);
    esC.deleteUser(instance.id, (res) => {
      console.log(res);
    });
  });
  return users;
};