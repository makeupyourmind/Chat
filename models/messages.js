'use strict';
module.exports = (sequelize, DataTypes) => {
  const messages = sequelize.define('messages', {
    body: DataTypes.STRING,
    senderName: DataTypes.STRING,
    senderEmail: DataTypes.STRING
  }, {});
  messages.associate = function(models) {
    // associations can be defined here
  };
  return messages;
};
