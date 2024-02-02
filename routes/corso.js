'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const dao = require('../models/dao.js');
const { get } = require('./index.js');


// form di aggiungi corso
router.get('/add-corso', (req, res, next)=>{
    res.render('addCorso');
});

// Aggiungi corso nel db
router.post('/insert-corso', async function(req, res, next) {
    const { titolo, descrizione, categoria } = req.body;
    const author = req.user.username;
  
    try {
      await check('titolo', 'Title required (1-20 char)')
        .exists()
        .isLength({ min: 1, max: 20 })
        .run(req);
  
      await check('descrizione', 'Description required (>10 chars)')
        .exists()
        .isLength({ min: 10 })
        .run(req);
  
      await check('categoria', 'Category required (3-15 chars)')
        .exists()
        .isLength({ min: 3, max: 15 })
        .run(req);
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const alert = errors.array();
        return res.render('addCorso', { message: alert[0].msg });
      }
  
      let img;
      let path;
  
      if (req.files !== null) {
        img = req.files.imgCorso;
        path = '/images/' + img.name;
  
        await img.mv(`./public/images/${img.name}`);
      } else {
        path = '/images/defaultCorso.jpg';
      }
  
      const message = await dao.uploadCorso(titolo, path, descrizione, categoria, author);
      if (message) {
        res.render('addCorso', { message });
      } else {
        res.redirect('/profile');
      }
    } catch (error) {
      // Gestione degli errori
      next(error);
    }
  });

  //modifica corso
  router.get('/modifica-corso/:id_corso', async function(req, res, next) {
    const id = req.params.id_corso;
  
    try {
      const corso = await dao.getCorsoById(id);
  
      if (corso && corso.autore === req.user.username) {
        res.render('modifyCorso', { title: 'Modifica Corso', corso });
      } else {
        res.redirect('back');
      }
    } catch (error) {
      // Gestione degli errori
      next(error);
    }
  });

  router.post('/modifica-corso', async function(req, res, next) {
    const id = req.body.id_corso;
    const titolo = req.body.titolo;
    const descrizione = req.body.descrizione;
    const categoria = req.body.categoria;
    const id_utente = req.user.id;
  
    try {
      const userN = await dao.getUsernameByCorsoId(id);
  
      if (userN && userN.autore === req.user.username) {
        await dao.updateCorsoById(titolo, descrizione, categoria, id);
        const utente = await dao.getUserData(id_utente);
        const corsi = await dao.getCorsiByUser(req.user.username);
  
        res.render('profile', {
          title: 'Pagina personale',
          utente,
          corsi,
          message2: 'Modifica avvenuta con successo.',
        });
      } else {
        res.redirect('back');
      }
    } catch (error) {
      // Gestione degli errori
      next(error);
    }
  });
  //cancella un corso
  router.post('/cancella-corso', async function(req, res) {
    const id_corso = req.body.id_prog;
  
    try {
      const message = await dao.deleteCorsoById(id_corso);
      const utente = await dao.getUserData(req.user.id);
      const corsi = await dao.getCorsiByUser(req.user.username);
  
      res.render('profile', {
        title: 'Pagina personale',
        message2: message,
        utente,
        corsi
      });
    } catch (error) {
      // Gestione degli errori
      next(error);
    }
  });
  
  module.exports = router;