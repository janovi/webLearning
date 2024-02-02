'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const dao = require('../models/dao.js');

//crea la pagina del rapporto commenti-utente
router.get('/report-commenti', function(req, res, next) {
    dao.getCommentsByUserId(req.user.id).then((report) => {
        res.render('commentiRapporto', { title: 'Report Commenti', report});
    })
})

//crea la pagina del rapporto progetti seguiti
router.get('/report-follows', function(req, res, next) {
    dao.getFollowedByUserId(req.user.id).then((report) => {
        res.render('followsRapporto', { title: 'Report dei Corsi seguiti', report});
    })
})

//crea la pagina del rapporto documenti piaciuti
router.get('/report-likes', function(req, res, next) {
    dao.getLikedByUserId(req.user.id).then((report) => {
        res.render('likesRapporto', { title: 'Report dei Documenti piaciuti', report});
    });
})

// Segui corso
router.post('/follow-corso', function(req, res, next){
    const id_utente = req.user.id;
    const id_corso = req.body.corso;
    dao.addInFollows(id_utente, id_corso).then(() => {
        dao.getSeguitiUtente(id_utente).then((corsi) => {
            res.render('index', {title: 'Home', corsi});
        })
    })
})

// Smetti di seguire il corso
router.post('/unfollow-corso', function(req, res, next){
    const id_utente = req.user.id;
    const id_corso = req.body.corso;
    dao.deteleInFollows(id_utente, id_corso).then(() => {
        dao.getSeguitiUtente(id_utente).then((corsi) => {
            res.render('index', {title: 'Home', corsi});
        })
    })
})

// Mett Like al Documento corso
router.post('/like-documento', function(req, res, next){
    const id_utente = req.user.id;
    const id_documento = req.body.documento;
    dao.addInLiked(id_utente, id_documento).then(() => {
        res.redirect('back');
    })
})

// Togli Like al documento
router.post('/dislike-documento', function(req, res, next){
    const id_utente = req.user.id;
    const id_documento = req.body.documento;
    dao.deteleInLiked(id_utente, id_documento).then(() => {
        res.redirect('back');
    })
})

//crea la pagina del report delle donazioni
router.get('/donazione-rapporto/:id_corso', function(req, res, next){
    let id_corso = req.params.id_corso;

    dao.getAllDonations().then((report) => {
        dao.getDonationsTotals().then((totals) => {
            report = report.filter(x => x.id_corso==id_corso)
            totals = totals.filter(x => x.id_corso==id_corso)
            res.render('donazioneRapporto', {title: 'Elenco Donazioni', report, totals})
        })
    })
});

//crea la pagina del report delle donazioni del singolo utente (ancora da creare un template apposito)
router.get('/donazione-rapporto', function(req, res, next){
    let id_utente = req.user.id;

    dao.userDonationReport(id_utente).then((report) => {
        
        let totals = [];
        res.render('donazionerapporto', {title: 'Elenco Donazioni', report, totals});
    })
});
module.exports = router;