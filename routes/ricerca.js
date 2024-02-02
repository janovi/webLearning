'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const dao = require('../models/dao.js');

router.post('/search', function(req, res, next) {
    const tipo = req.body.tipo;
    const search = req.body.search;
  
    if (tipo === 'Scegli la ricerca' || search === '') {
      return res.redirect('/');
    }
  
    let promise;
    if (tipo === 'Per Titolo / Descrizione') {
      promise = dao.combinedSearch(search);
    } else if (tipo === 'Per Categoria') {
      promise = dao.categorySearch(search);
    }
  
    promise.then((list) => {
      res.render('search', { list });
    });
  });
  

module.exports = router;