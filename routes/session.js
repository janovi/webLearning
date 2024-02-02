'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const app = require('../app.js');
const dao = require('../models/dao.js');
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

// Login
router.get('/login', (req, res, next)=> {
  res.render('login');
});

// called by login-form
router.post('/login', (req, res, next) => {
   passport.authenticate('local', (err, user, info)=> {
     if (err) { return next(err) }
     if (!user) {
         return res.render('login', {'message': info.message});
     }
     req.login(user, function(err) {
       if (err) { return next(err); }
       res.redirect('/');
     });
   })(req, res, next);
});

// Registrazione
router.get('/signUp', function(req, res, next) {
  res.render('signUp');
});

// called by signUp-form
router.post('/signUp', urlencodedParser, [
  check('username', 'Username must be 5-15 characters long')
      .exists()
      .isLength({ min: 5,max: 15 }),
  check('password', 'Password must be 10 characters long')
      .exists()
      .isLength({min: 10})
], function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let check = req.body.docente;
    if(check==='on'){
        check=1;
    }
    else{
        check=0;
    }

    let img;
    let path;
    if (req.files===null){
      path='/images/defaultUser.png';
    }else{
      img = req.files.foto;
      img.mv(`./public/images/${img.name}`, function(err) {
        if (err){
            return res.status(500).send(err);
        }
      });
      path = '/images/'+img.name;
    }
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        const alert = errors.array()
        res.render('signUp', {message: alert[0].msg})
    }
    else {
      dao.uploadUser(password, username, path, check).then((message) => {
          if(message){
              res.render('signUp', {message});
              
          }
          else{
           
              res.redirect('/');
          }
      });
    }
});

router.get('/logout', function(req,res,next){
  req.session.destroy(() => {
      res.redirect('/');
    })
});


module.exports = router;