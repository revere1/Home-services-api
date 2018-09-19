'use strict';
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/config.json')['system'];
module.exports = (sequelize, DataTypes) => {
  var mobile_users = sequelize.define('mobile_users', {
    user_name:{ 
    type:DataTypes.STRING,
    allowNull:false,
    validate:{
    
        len: {
          args: [6, 20],
          msg: "Name should be between 6 and 20 characters in length"
      }
    }
    },
    user_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        len: {
          args: [6, 120],
          msg: "Email address should be between 6 and 120 characters in length"
        },
        isEmail: {
          msg: "Email address should be valid"
        },
        isUnique: function (value, next) {
          var self = this;
          mobile_users.find({
            where: { user_email: value },
            attributes: ['id']
          }).done(function (user, error) {
            if (error) {
              return next(error);
            }
            else if (user) {
              if (user && self.user_email !== user.user_email) {
                return next('Email address already in use!');
              }
            }
            next();
          });
        }
      }
    },
    password :DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
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
        return bcrypt.compareSync(password, user.password)
      },
      getFullname: function () {
        return [this.firstname, this.lastname].join(' ');
      }
    },
    hooks: {
      beforeSave: (mobile_users, {}) => {
        
      //  mobile_users.password = bcrypt.hashSync(mobile_users.password, bcrypt.genSaltSync(config.salt), null);
       mobile_users.status = 1;
      }
    }
  

});

//   mobile_users.beforeCreate(function(mobile_users, options) {
    
//     return new Promise ((resolve, reject) => {
//       mobile_users.generateHash(mobile_users.password, function(err, encrypted) {
//             if (err) return reject(err);       

//             mobile_users.password = encrypted;           
//             return resolve(mobile_users, options);
//         });
//     });
// });
  mobile_users.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(config.salt), null);
  }
  return mobile_users;
};