'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const passport = require('passport');
const app = require('../app.js');
const dao = require('../models/dao.js');


//crea form per le donazioni
router.get('/donazioni/:id_corso', function (req, res) {
    const user_id = req.user.id;
    const id_corso = req.params.id_corso;

    dao.checkDonations(user_id, id_corso).then((output) => {
        if(output===undefined) {
            res.render('donazione', { title: 'Aggiungi Donazione', id_corso,type:'new'});
        }
        else{
            res.render('donazione', { title: 'Incrementa donazione', id_corso,output,type:'inc'}
            )
        }
    })
})

//aggiunge una nuova donazione
router.post('/add-donation', [
    check('card','card must have 16 digits!').notEmpty().isLength({min:16, max:16}).isInt().isCreditCard(),
    check('ccv', 'ccv must have 3 digits!').notEmpty().isLength({min:3, max:3}).isInt(),
    check('expMM','expMM must have 2 digits!').notEmpty().isInt().isLength({min:2, max:2}),
    check('expYY','expYY must have 4 digits!').notEmpty().isInt().isLength({min:4, max:4}),
    check('importo','the sum must be grater then 0').notEmpty().isInt({min:1})
], function (req, res) {

    const user_id = req.user.id;
    const id_corso = req.body.id_corso;
    const importo = req.body.importo;

    let valid = true;

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        
        valid = false;
        const alert = errors.array();
        
        res.render('donazione', { title: 'Aggiungi Donazione', id_corso,type:'new',message:alert[0].msg});
    }
    else{
      const anno = req.body.expYY;
      const annoCorrente = new Date().getFullYear();
      if(anno < annoCorrente){
        valid = false;
        dao.getSeguitiUtente(user_id).then((corsi) => {
            res.render('index', {title: 'Home', message: `Carta scaduta nel ${anno}!`, corsi});
        })
      }
      else if(anno == annoCorrente){
        const meseCorrente = new Date().getMonth();
        const mese = req.body.expMM;
        if(mese-1 < meseCorrente){
            valid = false;
            dao.getSeguitiUtente(user_id).then((corsi) => {
                res.render('index', {title: 'Home', message:`Carta scaduta nel ${mese}/${anno}!`, corsi});
            })
        }
      }
  
      if(valid){
        //registra donazione
        dao.addDonation(user_id, id_corso, importo).then(() =>{
            dao.getSeguitiUtente(user_id).then((corsi) => {
                res.render('index', {title: 'Home', message2: 'Donazione effettuata', corsi});
            })
        })
      }
    }
});

//incrementa una donazione già esistente
router.post('/inc-donation', [
    check('card','card must have 16 digits!').notEmpty().isLength({min:16, max:16}).isInt().isCreditCard(),
    check('ccv', 'ccv must have 3 digits!').notEmpty().isLength({min:3, max:3}).isInt(),
    check('expMM','expMM must have 2 digits!').notEmpty().isInt().isLength({min:2, max:2}),
    check('expYY','expYY must have 4 digits!').notEmpty().isInt().isLength({min:4, max:4}),
    check('importo','the sum must be grater then 0').notEmpty().isInt({min:1})
], function(req, res) {
    const id_donazione = req.body.id_donazione;
    const id_corso = req.body.id_corso;
    const importo = parseInt(req.body.importo);
    const user_id = req.user.id;

    let valid = true;

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        valid = false;
        const alert = errors.array();
        dao.checkDonations(user_id, id_corso).then((output) => {
            res.render('donazione', { title: 'Aggiungi Donazione', output, id_corso,type:'inc',message:alert[0].msg});
        })
        
    }
    else{
      const anno = req.body.expYY;
      const annoCorrente = new Date().getFullYear();
      if(anno < annoCorrente){
        valid = false;
        dao.getSeguitiUtente(user_id).then((corsi) => {
            res.render('index', {title: 'Home', message: `Carta scaduta nel ${anno}!`, corsi});
        })
      }
      else if(anno == annoCorrente){
        const meseCorrente = new Date().getMonth();
        const mese = req.body.expMM;
        if(mese-1 < meseCorrente){
            valid = false;
            dao.getSeguitiUtente(user_id).then((corsi) => {
                res.render('index', {title: 'Home', message:`Carta scaduta nel ${mese}/${anno}!`, corsi});
            })
        }
      }
  
      if(valid){
        //registra donazione
        dao.getDonationById(id_donazione).then((donazione) => {
            const don_imp = parseInt(donazione.importo);
            const somma = don_imp + importo;
            dao.updateDonation(somma, id_donazione).then(() => {
                dao.getSeguitiUtente(user_id).then((corsi) => {
                    res.render('index', {title: 'Home', message2: 'Donazione effettuata', corsi});
                })
            });
        });
      }
    }
});


module.exports = router;