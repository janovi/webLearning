'use strict'; 
const express = require('express');
const moment = require('moment');
const router = express.Router();
const dao = require('../models/dao.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user == undefined || req.user == null || req.user == ''){
   
    dao.getCorsi().then((corsi) => {
      

      res.render('index', {title: 'Home', corsi});
    })
  }
  else{
    const id_utente = req.user.id;
      dao.getSeguitiUtente(id_utente).then((corsi) => {
        res.render('index', { title: 'Home', corsi});
      })
  }
});


  // GET documenti su un corso 

router.get('/corso/:id_corso', function(req, res, next) {
    let id_corso = req.params.id_corso;
    res.locals.corso = id_corso;
    let id_utente;
    if(req.user===undefined){
      id_utente = 0;
    }
    else{
      id_utente = req.user.id;
    }
  
    dao.getDocsByIdCorso(id_corso).then((documenti) => {
      dao.getCorsoNameById(id_corso).then((nome) => {
        
        res.render('resources', { title: 'Risorse' , documenti, nome, id_corso, id_utente});
      })  
    })
  });
 
  /* GET documento di un corso
  richiamato dal link di apri risorse
*/

router.get('/corso/:id_corso/documento/:id_documento', function(req, res, next) {
  let id_documento = req.params.id_documento;
  let id_corso = req.params.id_corso;
  let id_utente;
  if(req.user===undefined){
    id_utente = 0;
  }
  else{
    id_utente = req.user.id;
  }
  dao.getDocsByIdCorso(id_corso).then((documenti) => {
    dao.getCorsoNameById(id_corso).then((nomeCorso) => {
      dao.getCommentsByDocId(id_documento).then((commenti) => {
        dao.getDocTitleByIdDoc(id_documento).then((titolo) => {

            dao.getPreferito(id_utente, id_documento).then ((preferito) =>{
              res.render('commenti', { title: 'Commenti', documenti, nomeCorso, commenti, titolo, preferito, id_utente});
            })
          
        })
      })
    })  
  })
});

  module.exports = router;