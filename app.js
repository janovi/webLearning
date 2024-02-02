'use strict';
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session'); //express session middleware
const moment = require('moment'); //library for date/time
const fileUpload = require('express-fileupload');
const { check } = require('express-validator');

const passport = require('passport'); //authentication middleware fore Node.js

const db = require('./db.js'); //db reference
const userDao = require('./models/user-dao.js'); //get user an get idUser
const dao = require('./models/dao.js'); //data access object


//require routes
const indexRouter = require('./routes/index');
const sessionRouter = require('./routes/session');
const corsoRouter = require('./routes/corso');
const profileRouter = require('./routes/profile');
const documentoRouter = require('./routes/documento');
const commentiRouter = require('./routes/commenti');
const donazioneRouter = require('./routes/donazione');
const rapportoRouter = require('./routes/rapporto');
const ricercaRouter = require('./routes/ricerca');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// set up the session
app.use(session({
  //store: new FileStore(), 
  secret: 'non posso lasciare il mio segreto perché è confidenziale',
  resave: false,
  saveUninitialized: false ,
  /*cookie: {
    maxAge: 3 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 3 * 60 * 60 * 1000)
  }*/
  
}));

//initializo passport
app.use(passport.initialize());
app.use(passport.session());

// Configurazione di Passport per l'autenticazione
//verifica di username e password
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then(({user, check}) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!check) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
  }
));
// serialize and de-serialize the user (user object <-> session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userDao.getUserById(id).then(user => {
    done(null, user);
  });
});


//chek if req is authenticated, if not redirect to login
const requireLogin = (req, res, next) => {
  if(req.isAuthenticated())
    next();
  else
    res.redirect('/login');
}

//chek if req is authenticated
const isLogIn = (req, res, next) => {
  if(req.user){
    res.locals.loggato='true'
  }else{
    res.locals.loggato='false'
  }
  next();
}

//chek if req.user is is admin
const isDocente = (req, res, next) => {
  const id = req.user.id;
  const sql = 'SELECT admin FROM utenti WHERE id_utente=?';
  db.get(sql, [id], (err, result) =>{
    if(err){
      throw(err);
    }
    else if(result.admin===1){ //Docente
      next();
    }
    else if(result.admin===0){ //studenti
      const message = 'Studente'; 
      dao.getUserData(id).then((utente) => {
        res.render('profile', {message, utente});
      })
    }
  })
}

// Upload delle immagini
app.use(fileUpload());


// define default variables for the views
app.use(function (req, res, next) {
  app.locals.moment = moment;
  app.locals.title = '';
  app.locals.message = '';
  app.locals.message2 = '';
  app.locals.active = '';
  next();
});


//map routes

//search (post)
app.use('/', isLogIn,ricercaRouter); 

/* /login (get,post)  /registrazione (get,post) /logout (get) */
app.use('/', isLogIn, sessionRouter);  

/*
  / (get) Home
  /corso/:id_corso (get) 
  /corso/:id_corso/documento/:id_documento (get)
*/
app.use('/', isLogIn, indexRouter); 

/*
  /modifica-documento/:id_documento (get)
  /modifica-documento (post)
  /cancella-documento (post)
  /add-document/:id_corso (get)
  /add-document (post)
*/
app.use('/', requireLogin, documentoRouter);

/*
  /donations-report/:id_corso (get)
  /donations-report (get) 
  /report-follows (get)
  /follow-corso (post)
  /unfollow-corso (post)
  /report-likes (get)
  /like-document (post)
  /like-document (post)
  /report-commenti (get)
*/
app.use('/', requireLogin, rapportoRouter);

/*
  /insert-commento (post)
  /cancella-commento (post)
  /modifica-commento/:id_commento (get)
  /modifica-commento (post)
*/
app.use('/', requireLogin, commentiRouter);


/*
/donazioni/:id_corso (get)
  /add-donation (post)
  /inc-donation (post)
*/
app.use('/', requireLogin, donazioneRouter);

//profile (get)
app.use('/', requireLogin, profileRouter);

/*
  /profile (get)
  /add-corso (get)
  /insert-corso (post)
  /modifica-corso/:id_corso (get)
  /modifica-corso (post)
  /cancella-corso (post)
*/
app.use('/', requireLogin, corsoRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
