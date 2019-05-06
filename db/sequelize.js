const Sequelize = require('sequelize');
const UserModel = require('../models/user');
const TempModel = require('../models/temp');
const MessagesModel = require('../models/messages');
//                              database, username, password
const sequelize = new Sequelize('postgres', 'root', 'root', {
  host: 'ec2-3-83-109-153.compute-1.amazonaws.com',
  dialect: 'postgres',
  port: 5432
})
 //module.exports = UserModel(sequelize, Sequelize); profit

 const User = UserModel(sequelize, Sequelize);
 const Temp = TempModel(sequelize, Sequelize);
 const Messages = MessagesModel(sequelize, Sequelize);
module.exports = {User, Temp, Messages};
 //module.exports = TempModel(sequelize, Sequelize);
