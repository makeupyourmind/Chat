const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
let cors = require('cors');
const { check, validationResult } = require('express-validator/check');
const {Messages} = require('./db/sequelize');
app.use(express.static("photo"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static("uploads"));

let router = require('./routers/router');

app.use('/api', router);

connections = [];
//online = [];
let online = {}, cart = [];

io.sockets.on('connection', function(socket) {
	console.log("an user connected : ", socket.id);
	//let clients = io.sockets.clients();
	//let online = Object.keys(io.engine.clients);
	connections.push(socket);
	socket.on('disconnect', function(data) {
		connections.splice(connections.indexOf(socket), 1);
		console.log("user disconnected", socket.id);

		let position = null;
		cart.find((item, index) => item.id === socket.id
		? position = index.toString()
		: null);
			position && cart.splice(Number(position), 1);

			console.log("ONLINE MASSIVE AFTER disconnectUser", cart);
			socket.emit('disconnectUser', {onlineUser: cart});
	});

	 socket.on('typing', function(data){
		 socket.broadcast.emit('typing', data);
	 })

  	socket.on('userConnected', function(data) {
      console.log("DATA.user ONLINE : ", data.user);
			//console.log("online.data.isLength : ", online.data);

			data.id = socket.id;
			console.log("data : ", data);

			cart.push(data); //profit
			//online.push(data.user);
			console.log("ONLINE MASSIVE user AFTER connected : ", cart);
      Messages.findAndCountAll()
			.then((data) => {
				 let limit = 10;
				 let offset = data.count - limit;
				 //console.log("offset : ", offset);
				 Messages.findAll({
					 limit: limit,
					 offset: offset
				 })
      .then(result =>{
				//console.log("cart : ", cart);
        io.sockets.emit('show message user', {result: result, onlineUser: cart});
			 });
			})
    });
	socket.on('send message', function(data) {
 //console.log("DATA.msg : ", data.msg);
    Messages
       .create({
         body: data.msg,
         senderName: data.senderName
       })
       .then( (result) => {
         //console.log("result ", result.dataValues);
         io.sockets.emit('add message on page', {messageData: result.dataValues });
       })
	})

});

server.listen(5000, () => console.log("Server started on port 5000"));
