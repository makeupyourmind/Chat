'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: DataTypes.STRING,
    contain: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    photo: DataTypes.STRING
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};