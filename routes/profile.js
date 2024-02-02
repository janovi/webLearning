'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const dao = require('../models/dao.js');

router.get('/profile', (req, res, next)=>{
    dao.getUserData(req.user.id).then((utente) => {
        dao.getCorsiByUser(req.user.username).then((corsi) => {
            res.render('profile', {title: 'Pagina personale', utente, corsi});
        })
    })
});



module.exports = router;