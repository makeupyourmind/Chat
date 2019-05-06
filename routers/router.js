const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const Ctrl = require('../controllers/controllers')
const { check, validationResult } = require('express-validator/check');
let multer  = require('multer');
let upload = multer({ dest: 'uploads/' });

router.route('/test/:countMessage').get(Ctrl.test);

router.route('/pagination/:countMessage').get(Ctrl.pagination);

router.route('/upload').post(upload.single('avatar'), verifyToken, Ctrl.upload)

router.route('/resetPasswordConfirm').post(verifyToken,
  [check('newPassword').isLength({ min: 5 })],Ctrl.resetPasswordConfirm);

router.route('/resetPassword').post([check('email').isEmail()], Ctrl.resetPassword)

router.route('/signUp').post([check('name').isLength({ min: 3 }),
 check('password').isLength({ min: 5 }),
 check('email').isEmail()], Ctrl.signUp)


router.route('/login').post([check('name').isLength({ min: 3 }),
 check('password').isLength({ min: 5 }),
 check('email').isEmail()], Ctrl.login)

router.route('/confirm').post(Ctrl.confirm)

router.route('/user').post(verifyToken, Ctrl.user)

function verifyToken(req, res, next) {

  //Get auth
  const bearerHeader = req.headers['authorization'];
  //console.log("bearerHeader : ", bearerHeader)
   if(typeof bearerHeader !== 'undefined'){
     //console.log("good");
      const bearer = bearerHeader.split(' ');
      //get token array
      const bearerToken = bearer[1];
      //console.log("bearerToken : ", bearerToken);
      //set token
      req.token = bearerToken;
      //next
      next();
   }
   else {
     res.sendStatus(401);
   }
}

module.exports = router;
