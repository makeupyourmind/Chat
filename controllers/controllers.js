const { User, Temp, Messages } = require('../db/sequelize')
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

exports.test = function (req,res){
  res.send(req.params.countMessage);
}

exports.pagination = function(req,res){

  //console.log("req.params.page",req.params.page);

  let limit = 10;   // number of records per page

 Messages.findAndCountAll()
 .then((data) => {

   let pages = Math.ceil(data.count / limit);

   let countMessage = req.params.countMessage;

   const offset = data.count - countMessage - limit;

   if(offset <= 0){
     offset = 0;
   }

   Messages.findAll({
     attributes: ['id', 'body', 'senderName', 'createdAt'],
     limit: limit,
     offset: offset,
     $sort: { id: 1 }
   })
   .then((users) => {
     res.status(200).json({'result': users, 'count': data.count, 'pages': pages});
   });
 })
 .catch(function (error) {
   res.status(500).send('Internal Server Error');
 });
}

exports.upload = function (req,res){
  console.log("req.file : ", req.file);
   if (!req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        let filePath = './uploads/' + req.file.filename;
        fs.unlinkSync(filePath);
        res.sendStatus(400).send("Error format");
    }else {
   jwt.verify(req.token, 'secretkey', (err, authData) => {
       console.log("authData : ", authData.user.name);
        User.update(
        { photo: req.file.path },
        { where: { name: authData.user.name } }
         )
        .then(result =>{
          //let result = req.file.path +
          res.send(req.file.path)
        })

     });
   }
   //res.send("ok");
}

exports.resetPasswordConfirm = function(req,res) {
  const errors = validationResult(req);
  console.log("errors, ", errors.isEmpty());
  if (!errors.isEmpty()) {
    let arr = errors.array().map(function(current){
      return current.param;
    })
    console.log("ar : ",arr);
   return res.status(422).json(
     { errors: arr, msg: "Too short" }
   );
  }

  jwt.verify(req.token, 'secretkey', (err, authData) => {
      console.log("authData : ", authData.user.name);

      let password = req.body.newPassword;
       let salt = bcrypt.genSaltSync(10);
       let passwordToSave = bcrypt.hashSync(password, salt);

       User.update(
       { password: passwordToSave },
       { where: { name: authData.user.name } }
        )
       .then(result =>{
         res.send("Updated")
       })

    });

}

exports.resetPassword = function(req,res) {
  User
  .findOne({
  where: {email: req.body.email},
  attributes: ['name','password']
  })
  .then(result => {
    //console.log("result", result);
    if(result !== null){
      const user = result;
      jwt.sign({user}, 'secretkey', (err,token) => {
              console.log("token : ", token);

              const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);

                     //res.render(__dirname + '/views/done', {data : req.body.text } );
                const msg = {
                  to: req.body.email,
                  from: 'support@gmail.com',			//sender's email
                  subject: 'Verification url to resetPassword',//Subject
                  text: "Your verification url : ",
                  html: 'http://' + "ec2-18-233-98-180.compute-1.amazonaws.com/" + '/resetPasswordConfrim/' + token		//content		//HTML content
                };
                sgMail.send(msg);
                res.send("url sent successfully");
                //res.json({token});
        });

    }
    else {
      console.log("BBAAAAD");
      res.sendStatus(401).send("Bad Request");
    }
  })
  .catch(e => {
    res.sendStatus(401).send("Bad Request");
  })
}

exports.user = function(req,res) {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
      //console.log("authData : ", authData);
      // console.log("req.token : ", req.token);
       if(err){
         console.log("err : ", err);
         res.sendStatus(401);
       }
       else {
         res.json({
            authData
         });
       }
    });
}

exports.login = function(req,res){
  const errors = validationResult(req);
  console.log("errors, ", errors.isEmpty());
  if (!errors.isEmpty()) {
    //console.log(errors.array());
    //let er = errors.array();
    //console.log("er.param : ", er.param);
    let arr = errors.array().map(function(current){
      return current.param;
      //console.log("current : ", current.param, current.msg);
      //return res.status(422).json({ param: current.param, msg: "Too short" });
    })
    //console.log("ar : ",arr);
   return res.status(422).json(
     { errors: arr, msg: "Too short or incorrect email" }
   );
  }
  var password = req.body.password;

  User
  .findOne({
  where: {email: req.body.email},
  attributes: ['name','password']
  })
  .then(task => {
  //console.log("res : ", task);
   //res.send(task);
   if(task !== null){

     //res.send(task.password);
      let compare = bcrypt.compareSync(password, task.password);
        //console.log("compare : ", compare);
      if( compare === true){
        //.send('ok');
        const user = task;
        jwt.sign({user}, 'secretkey',  { expiresIn: '3600s'} , (err,token) => {
               res.json({
                 token
               });
          });
      }
      else {
        res.status(400).send("Bad Request");
      }
   }
   else {
     res.status(400).send("Bad Request");
   }
  })
  .catch(e => {
  res.send(e);
  })
}

exports.signUp = function(req,res){
  console.log("HHHHHHHHHHHHHHH : ", req.body.name, req.body.password, req.body.email);
  const errors = validationResult(req);
 if (!errors.isEmpty()) {
   let arr = errors.array().map(function(current){
     return current.param;
     //console.log("current : ", current.param, current.msg);
     //return res.status(422).json({ param: current.param, msg: "Too short" });
   })
   //console.log("ar : ",arr);
  return res.status(422).json(
    { errors: arr, msg: "Too short or incorrect email" }
  );
   //return res.status(422).json({ errors: errors.array() });
 }
  console.log(req.body);

//var name = req.body.name;
var email = req.body.email;
console.log("email : ", email);
var password = req.body.password;
var salt = bcrypt.genSaltSync(10);
var passwordToSave = bcrypt.hashSync(password, salt);
console.log("salt : ", salt);
console.log("passwordToSave : ", passwordToSave);
   User
   .findOne({
  where: {email: email},
  attributes: ['id', 'name', 'password']
  })
.then(project => {
  console.log("project : ", project);
  //res.send(project);
    if(project !== null){
      res.status(400).send('Bad Request');
    }else {
      const sgMail = require('@sendgrid/mail');
             sgMail.setApiKey(process.env.SENDGRID_API_KEY);
             let code = rand=Math.floor((Math.random() * 100) + 54);
             //res.render(__dirname + '/views/done', {data : req.body.text } );
             const msg = {
               to: req.body.email,
               from: 'support@gmail.com',			//sender's email
               subject: 'Verification code to signUp',//Subject
               text: "Your verification code : ",
               html: code.toString()		//content		//HTML content
             };
             console.log("code : ", code);
             //res.send(code.toString());
             sgMail.send(msg);
             //res.send("ok");
             Temp
                .create({
                  name: req.body.name,
                  password: req.body.password,
                  email: req.body.email,
                  code: code
                })
                .then((student) => res.status(201).send("Good Request"))
                .catch((error) => res.status(400).send(error));
    }
})
.catch((e) => {
  res.status(400).json({error: e});
})
}

exports.confirm = function(req,res){
 console.log("LLLLLLLLLLLL");
  Temp
  .findOne({
   where: {code: req.body.code},
   attributes: ['name','password','email', 'code']
 })
 .then(project => {
   console.log("project :", project);
   console.log("typeof : ", typeof project);
   if(project){
     var password = project.dataValues.password;
     var salt = bcrypt.genSaltSync(10);
     var passwordToSave = bcrypt.hashSync(password, salt);
     console.log("salt : ", salt);
     console.log("passwordToSave : ", passwordToSave);
         User
         .create({
           name: project.dataValues.name,
           password: passwordToSave,
           email: project.dataValues.email
        })
      .then(project => {
        Temp.create().then(task => {
          // now you see me...
          return task.destroy();
        })
        res.status(200).send('Good Request');
      })
   }else {
     console.log("fffffffff");
     res.status(400).send('Bad Request')
   }
   //res.send(project);
 })
 .catch(e => {
   res.send(e);
 })
}


// exports.module  =  {
//     main: function (req,res){
//        res.send("ok main");
//     },
//
//     signUp: function(req,res) {
//
//     },
//
// }
