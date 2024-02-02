'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const dao = require('../models/dao.js');
const fs = require('fs');
const fileUpload = require('express-fileupload');



router.get('/add-documento/:id_corso', function(req, res, next){
    const id = req.params.id_corso;
    dao.getCorsoById(id).then((corso) => {
        dao.getUsernameByCorsoId(id).then((userN) => {
            if(userN.autore===req.user.username){
                res.render('addDocumento', {title: 'Aggiungi Documento', corso});
            }
            else{
                res.redirect('back');
            }
        })
    })   
  });
  
// Aggiungi documento al db

router.post('/add-documento', function(req, res, next){
  const id_corso = req.body.id_corso;
  const id_utente = req.user.id;
  let nomeDoc = req.body.nome;
  let descr = req.body.descrizione;
  let doc = req.files.documento;

  doc.mv(`./public/documenti/${doc.name}`, function(err) {
      if (err){
          return res.status(500).send(err);
      }
  });
  
  let path = '/documenti/'+doc.name;
  dao.uploadDocument(nomeDoc, descr, path, id_corso, id_utente).then((message) => {
      if(message){
          res.render('addcorso', {message});
      }
      else{
        dao.getUserData(id_utente).then((utente) => {
          dao.getCorsiByUser(req.user.username).then((corsi) => {
            res.render('profile', {title: 'Pagina personale', utente, corsi,message2:'Documento aggiunto con successo.'});
          })
        })
      }
  });
});

  
  function redirectToResources(res,id_doc){
    var id_corso;
    dao.getDocFromId(id_doc).then((doc)=>{
      id_corso = doc.id_del_corso;
      res.redirect('/corso/'+id_corso);
    });
  }
  
// mostra form modifica documento per l'autore
router.get('/modifica-documento/:id_documento', (req, res, next) => {
    const id_user = req.user.id;
    const id_documento = req.params.id_documento;
    
    dao.getDocFromId(id_documento).then((documento) => {
  
      if (documento.id_autore===id_user) {
        res.render('modifyDocumento', {title: 'Modifica Documento', documento});
      }
      else{
          dao.getSeguitiUtente(id_user).then((corsi) => {
            res.render('index', {message:'Modifica non consentita, username non abilitato.', corsi});
          })
      }
    })
  });

  
// modifica documento se autore
router.post('/modifica-documento', function(req, res, next) {

    const id_doc = req.body.id_documento;
    const title_doc = req.body.title_documento;
    const note_docu = req.body.note_documento;
    const id_user = req.user.id;
  
    dao.getUsernameByDocumentId(id_doc).then((userN) => {

    if(userN.id_autore===id_user){
      dao.updateDocById(title_doc, note_docu, id_doc).then(() => {
          redirectToResources(res,id_doc);
      })
    }else{
        dao.getSeguitiUtenteLoggato(id_user).then((corsi) => {
          res.render('index', {message:"Modifica non consentita, non sei l'autore del documento.", corsi});
        })
    }
    })
});

//cancela un documento
router.post('/cancella-documento', function(req, res) {
    const id_doc = req.body.id_doc;
    const id_utente = req.user.id;
    
    dao.getDocFromId(id_doc).then((documento) => {
  
      if (documento.id_autore===req.user.id) {
        const path = './public'+documento.percorso_documento;
  
        fs.unlink(path, (err) =>{
          console.log('UNLINK FALLITO');
          if (err){
            console.error(err);
          }
        })
        
        var id_corso;
        dao.getDocFromId(id_doc).then((doc)=>{
          id_corso = doc.id_del_corso;
        });
        dao.deleteDocById(id_doc).then(() => {
          res.redirect('/corso/'+id_corso);
        })    
      }
      else{
          dao.getSeguitiUtenteLoggato(id_utente).then((corsi) => {
            res.render('index', {message:"Cancellazione non consentita, non sei l'autore del documento.", corsi});
          })
      }
    })
  });
  

  


  module.exports = router;