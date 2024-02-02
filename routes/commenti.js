'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const dao = require('../models/dao.js');

router.get('/modifica-commento/:id_commento', (req, res, next) =>{
    const id_user = req.user.id;
    const id_commento = req.params.id_commento;

    dao.getOneCommentById(id_commento).then((commento) => {
        if(commento.id_utente===id_user){
            res.render('modifyCommenti', { title:'Modifica Commento', commento})
        }else{
            renderComments(res,id_user,commento.id_documento,'Operazione non consentita');
        }
    })
})

router.post('/modifica-commento', function(req, res, next) {
    const id_commento = req.body.id_commento;
    const commento = req.body.commento;
    const utente_commento = req.body.id_utente;
    const utente_sessione = req.user.id;
    
    let commentObject;
    dao.getOneCommentById(id_commento).then((commento) => {
        commentObject = commento;
    })

    if(String(utente_sessione)===utente_commento){
        dao.updateCommentById(commento, id_commento).then(() =>{
            renderComments(res,utente_sessione,commentObject.id_documento,'Modifica avvenuta con successo.');
        })
    }else{
        renderComments(res,id_user,commentObject.id_documento,'Operazione non consentita');
    } 
})

router.post('/cancella-commento', function(req,res,next) {
    const id_commento = req.body.id_cmt;
    const id_utente = req.user.id;

    dao.getOneCommentById(id_commento).then((commento) => {
        if(String(commento.id_utente)===String(req.user.id)){
            dao.deleteCommentById(id_commento).then(() => {
                renderComments(res,id_utente,commento.id_documento,'Commento cancellato');
            })
        }
        else{
            dao.getOneCommentById(id_commento).then((commento) => {
                renderComments(res,id_utente,commento.id_documento,'Operazione non consentita');
            })
        }
    })
})

router.post('/insert-comment', function(req,res,next){
    const id_utente = req.user.id;
    const id_doc = req.body.id_documento;
    let commento = req.body.commento;

    if(commento===''){
        renderComments(res,id_utente,id_doc,'Non si possono aggiungere commenti vuoti');
    }

    dao.addComment(id_utente, id_doc, commento).then(() =>{
        renderComments(res,id_utente,id_doc,'Commento aggiunto');
    })

})

function renderComments(res, id_utente, id_documento, messaggio){
    
    dao.getDocFromId(id_documento).then(doc => {
        var id_corso = doc.id_del_corso
        dao.getDocsByIdCorso(id_corso).then((documenti) => {
            dao.getProgNameById(id_corso).then((nomeCorso) => {
              dao.getCommentsByDocId(id_documento).then((commenti) => {
                dao.getDocTitleByIdDoc(id_documento).then((titolo) => {
                  
                    dao.getPreferito(id_utente, id_documento).then ((preferito) =>{
                        if(messaggio.includes("Non"))
                            res.render('commenti', { title: 'Commenti', documenti, nomeCorso, commenti, titolo, preferito, id_utente, message:messaggio});
                        else
                            res.render('commenti', { title: 'Commenti', documenti, nomeCorso, commenti, titolo, preferito, id_utente, message2:messaggio});
                    })
                  
                })
              })
            })  
          })
    });
}


module.exports = router;