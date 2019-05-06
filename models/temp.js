'use strict';
module.exports = (sequelize, DataTypes) => {
  const temp = sequelize.define('temp', {
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    code: DataTypes.STRING
  }, {});
  temp.associate = function(models) {
    // associations can be defined here
  };
  return temp;
};