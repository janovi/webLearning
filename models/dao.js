'use strict';
const bcrypt = require('bcrypt');
const db = require('../db.js');

//registra un utente al db con password cifrata
exports.uploadUser = function(password, username, path, check){
    return new Promise((resolve, reject) => {
        const saltRounds = 13;
        const salt = bcrypt.genSaltSync(saltRounds);
        const psw = bcrypt.hashSync(password, salt);
        const sql = 'INSERT INTO utenti ("password", "username", "portrait", "admin") VALUES (?, ?, ?, ?)';
  
        db.run(sql, [psw, username, path, check], (err, rows) => {
            if(err===null){
                const message = 'registrazione con successo';
                resolve(message);
            }
            else{
                const message = 'Username già presente';
                resolve(message);
            }
        })
    })
  }

//get tutti i corsi presenti nel db
exports.getCorsi = function(){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM corsi';
        db.all(sql, (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const corsi = rows.map((e) => ({id: e.id_corso, titolo: e.titolo_corso, img: e.img_corso, descrizione: e.descrizione_corso, categoria: e.categoria_corso, autore: e.autore}));
            resolve(corsi);
        })
    })
}



//get corsi seguiti da id dell'utente loggato
exports.getSeguitiUtente = function(id_utente){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT corsi.id_corso, corsi.titolo_corso, corsi.img_corso, corsi.descrizione_corso, corsi.categoria_corso, corsi.autore, seguiti.id_seguito, seguiti.id_utente, seguiti.corso_seguito FROM corsi LEFT JOIN seguiti ON corsi.id_corso = seguiti.corso_seguito AND seguiti.id_utente = ?;';
        db.all(sql, [id_utente], (err, rows) => {
            if(err){
                reject(err);
            }
            const corsi = rows.map((e) => ({id: e.id_corso, titolo: e.titolo_corso, img: e.img_corso, descrizione: e.descrizione_corso, categoria: e.categoria_corso, autore: e.autore, seguito: e.id_seguito, utente: e.id_utente, corso: e.id_corso}))
            resolve(corsi);
        })
    })
}

//get documenti relativi a un corso
exports.getDocsByIdCorso = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM documenti WHERE id_del_corso=? ';
        db.all(sql, [id], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const documenti = rows.map((x) => ({id:x.id_documento, titolo:x.nome_documento, note:x.note_documento, percorso:x.percorso_documento, id_corso:x.id_del_corso, autore:x.id_autore}));
            resolve(documenti);
        })
    })
}
//restituisce vero o falso se il documento è sato inserito tra i preferiti
exports.getPreferito = function(id_utente, id_documento) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id_preferito FROM preferiti WHERE id_utente = ? AND id_doc_pref = ?';
      db.get(sql, [id_utente, id_documento], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result !== undefined ? 'true' : 'false');
      });
    });
  };
  
  //ottieni i dati di un documento in base al suo id
exports.getDocFromId = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM documenti WHERE id_documento=? ';

        db.get(sql, [id], (err, documento) => {
            if(err){
                reject(err);
                return;
            }
            resolve(documento);
        })
    })
}
//cancella un documento in base al suo id
exports.deleteDocById = function(id){
    return new Promise ((resolve, reject) => {
        const sql = 'DELETE FROM documenti WHERE id_documento=?'

        db.run(sql, [id], (err) => {
            if(err){
                reject(err);
                return;
            }
            const message = 'Documento cancellato';
            resolve(message);
        })
    })
}
//ottiene il nome del corso in base al suo id
exports.getCorsoNameById = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT titolo_corso FROM corsi WHERE id_corso=?';
        db.get(sql, [id], (err, nome) => {
            if(err){
                reject(err);
                return;
            }
            resolve(nome);
        })
    })
}
//get commenti di uno specifico documento
exports.getCommentsByDocId = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id_commento, commenti.id_utente as id_utente, username, portrait, contenuto_commento FROM commenti JOIN utenti WHERE id_documento=? AND utenti.id_utente=commenti.id_utente ';
        db.all(sql, [id], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const commenti = rows.map((x) => ({id_commento:x.id_commento, id_utente:x.id_utente, utente:x.username, immagine:x.portrait, commento:x.contenuto_commento}));
            resolve(commenti);
        })
    })
}
//stampa un commento specifico
exports.getOneCommentById = function(id){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM commenti WHERE id_commento=?';
        db.get(sql, [id], (err, commento) => {
            if(err){
                reject(err);
                return;
            }
            resolve(commento);
        })
    })
}

//restituisce il titolo di un documento in base al suo id
exports.getDocTitleByIdDoc = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id_documento, nome_documento, percorso_documento, id_autore FROM documenti WHERE id_documento=?';
        db.get(sql, [id], (err, titolo) => {
            if(err){
                reject(err);
                return;
            }
            resolve(titolo);
        })
    })
}

//carica un corso nel db
exports.uploadCorso = function(title, img, description, category, author){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO corsi ("titolo_corso", "img_corso", "descrizione_corso", "categoria_corso", "autore") VALUES (?, ?, ?, ?, ?)';

        db.run(sql, [title, img, description, category, author], (err) => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}
//carica un documento al db associandolo ad un corso specifico già esistente
exports.uploadDocument = function(nome, descrizione, percorso, id_corso, utente){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO documenti ("nome_documento", "note_documento", "percorso_documento", "id_del_corso", "id_autore") VALUES (?, ?, ?, ?, ?)';

        db.run(sql, [nome, descrizione, percorso, id_corso, utente], (err) => {
            if(err){
                reject(err);
                return;
            } 
            resolve();
        })
    })
}

//modifica e aggiorna un documento
exports.updateDocById = function(nome_doc, note, id_documento){
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE documenti SET nome_documento=?, note_documento=?, WHERE id_documento=?';

        db.run(sql, [nome_doc, note, id_documento], (err) => {
            if(err) {
                reject(err);
                return;
            }
            resolve();
        })
    })
}
//aggiunge un commento ad un documento
exports.addComment = function(id_user, id_doc, commento){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO commenti ("id_utente", "id_documento", "contenuto_commento") VALUES (?, ?, ?)';

        db.run(sql, [id_user, id_doc, commento], (err) =>{
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}

//modifica un commento già esistente
exports.updateCommentById = function(contenuto, id_commento){
    return new Promise((resolve, reject) =>{
        const sql = 'UPDATE commenti SET contenuto_commento=? WHERE id_commento=?';

        db.run(sql, [contenuto, id_commento], (err) =>{
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}

//dato l'id di un utente ne ricava le informazioni per la pagina profilo
exports.getUserData = function(user_id){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT username, admin, portrait FROM utenti WHERE id_utente=?';
         db.get(sql, [user_id], (err, utente) =>{
            if(err){
                reject(err);
                return;
            }
            if(utente.admin===1){
                utente.admin='Docente';
            }
            else{
                utente.admin='Studente';
            }
            resolve(utente);
        })
    })
}

//ottiene i dati di un corso in base al id
exports.getCorsoById = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM corsi WHERE id_corso=?';
        db.get(sql, [id], (err, corso) => {
            if(err){
                reject(err);
                return;
            }
            resolve(corso);
        })
    })
}

//modifica e aggiorna le entries di un corso già esistente
exports.updateCorsoById = function(titolo, descrizione, categoria, id_corso){
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE corsi SET titolo_corso=?, descrizione_corso=?, categoria_corso=? WHERE id_corso=?';
        db.run(sql, [titolo, descrizione, categoria, id_corso], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            else{
                resolve();
            }
        })
    })
}

//dato l'id di un corso ne ricava il suo autore
exports.getUsernameByCorsoId = function(id_corso){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT autore FROM corsi WHERE id_corso=?';
        db.get(sql, [id_corso], (err, author) => {
            if(err){
                reject(err);
                return;
            }
            resolve(author);
        })
    })
}

//dato l'id di un documento, ricava l'id del suo autore
exports.getUsernameByDocumentId = function(id_documento){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id_autore FROM documenti WHERE id_documento=?';
        db.get(sql, [id_documento], (err, author) => {
            if(err){
                reject(err);
                return;
            }
            resolve(author);
        })
    })
}

//restituisce tutti i corsi di uno specifico docente
exports.getCorsiByUser = function(username){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM corsi WHERE autore=?';
        db.all(sql, [username], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const corsi = rows.map((x) => ({id_corso:x.id_corso, titolo:x.titolo_corso, img:x.img_corso, desc:x.descrizione_corso, cat:x.categoria_corso, aut:x.autore}));
            resolve(corsi);
        } )
    })
}
//cancella un corso dal suo id
exports.deleteCorsoById = function(id_corso){
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM corsi WHERE id_corso=?';
        db.run(sql, [id_corso], (err) => {
            if(err){
                reject(err);
                return;
            }
            const message = 'Corso cancellato';
            resolve(message);
        })
    })
}

//cancella un commento specificato dal suo id
exports.deleteCommentById = function(id){
    return new Promise((resolve, reject)=>{
        const sql = 'DELETE FROM commenti WHERE id_Commento=?';
        db.run(sql, [id], (err) =>{
            if(err){
                reject(err);
                return;
            }
            const message = 'Commento Cancellato';
            resolve(message);
        })
    })
}

//serve a controllare se è già presente almeno un'associazione utente-corso nella tabella delle donazioni
exports.checkDonations = function(id_utente, id_corso){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM donazioni WHERE id_utente = ? AND id_corso = ?';
        db.get(sql, [id_utente, id_corso], (err, data) => {
            if(err){
                reject(err);
                return;
            }
            resolve(data);
        })
    })
}

//aggiunge una nuova donazione al db
exports.addDonation = function(id_utente, id_corso, importo){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO donazioni ("id_utente", "id_corso", "importo") VALUES (?, ?, ?)';
        db.run(sql, [id_utente, id_corso, importo], (err) =>{
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}

//ottiene i dadi di una donazione in base al suo id
exports.getDonationById = function(id_donazione){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM donazioni WHERE id_donazione =?';
        db.get(sql, [id_donazione], (err, data) =>{
            if(err){
                reject(err);
                return;
            }
            resolve(data);
        })
    })
}

//aggiorna una donazione già esistente con un nuovo importo (precedentemente sommato)
exports.updateDonation = function(importo, id_donazione){
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE donazioni SET importo=? WHERE id_donazione=?';
        db.run(sql, [importo, id_donazione], (err) =>{
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}


//get tutte le donazioni
exports.getAllDonations = function(){
    return new Promise((resolve, reject) => {
        const sql = `SELECT donazioni.id_corso, titolo_corso, username, importo 
        FROM utenti 
        INNER JOIN donazioni ON utenti.id_utente = donazioni.id_utente 
        INNER JOIN corsi ON corsi.id_corso = donazioni.id_corso 
        ORDER BY username`;
        db.all(sql, (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const report = rows.map((x) => ({id_corso:x.id_corso, corso:x.titolo_corso, utente:x.username, importo:x.importo}));
            resolve(report);   
        })
    })

}
//get totali delle donazioni per corso
exports.getDonationsTotals = function(){
    return new Promise((resolve, reject) => {
        const sql = `SELECT donazioni.id_corso, titolo_corso, Sum(donazioni.importo) AS totale 
                     FROM utenti 
                     INNER JOIN donazioni ON utenti.id_utente = donazioni.id_utente 
                     INNER JOIN corsi ON corsi.id_corso = donazioni.id_corso 
                     GROUP BY titolo_corso `;
        db.all(sql, (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        })
    })
}

//restituisce tutti i commenti relativi ad un utente
exports.getCommentsByUserId = function(id){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT commenti.id_commento, commenti.id_documento, documenti.nome_documento, commenti.contenuto_commento FROM commenti JOIN documenti WHERE commenti.id_utente=? AND documenti.id_documento=commenti.id_documento';
        db.all(sql, [id], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const report = rows.map((x) => ({id_commento:x.id_commento, id_documento:x.id_documento, titolo_documento:x.nome_documento, contenuto:x.contenuto_commento}));
            resolve(report);
        })
    })
}

//restituisce i corsi seguiti da un utente specifico
exports.getFollowedByUserId = function(id){
    return new Promise ((resolve, reject) => {
        const sql = 'SELECT corsi.* FROM corsi JOIN seguiti WHERE seguiti.id_utente=? AND seguiti.corso_seguito=corsi.id_corso';
        db.all(sql, [id], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const report = rows.map((x) => ({id:x.id_corso, titolo:x.titolo_corso, img:x.img_corso, desc:x.descrizione_corso, cat:x.categoria_corso, aut:x.autore}));
            resolve(report);
        })
    })
}

//restituisce i documenti piaciuti da un utente specifico
exports.getLikedByUserId = function(id){
    return new Promise((resolve, reject) => {
        const sql = `SELECT documenti.*, corsi.titolo_corso 
                    FROM documenti 
                    JOIN preferiti 
                    JOIN corsi 
                    WHERE preferiti.id_utente=? 
                    AND documenti.id_documento=preferiti.id_doc_pref and corsi.id_corso=documenti.id_del_corso`;
        db.all(sql, [id], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            const report = rows.map((x) => ({id_documento:x.id_documento, titolo:x.nome_documento, note:x.note_documento, 
                path:x.percorso_documento, id_corso:x.id_del_corso, autore:x.id_autore, corso:x.titolo_corso}));
            resolve(report);
        })
    })
}

//ricerca per Categoria
exports.categorySearch = function (categoria){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM corsi WHERE categoria_corso LIKE ?';
        const ricerca = "%"+categoria+"%";
        db.all(sql, [ricerca], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        })
    })
}

//ricerca per titolo e descrizione
exports.combinedSearch = function (ric){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM corsi WHERE titolo_corso LIKE ? OR descrizione_corso LIKE ?';
        const ricerca = "%"+ric+"%";
        db.all(sql, [ricerca, ricerca], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        })
    })
}


//aggiungi il corso tra i seguiti
exports.addInFollows = function (id_utente, id_corso){
    return new Promise((resolve, reject) =>{
        const sql = 'INSERT INTO seguiti (id_utente, corso_seguito) VALUES (?, ?)'
        db.run(sql, [id_utente, id_corso], (err) => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}

//rimuove il corso tra i seguiti
exports.deteleInFollows = function (id_utente, id_corso){
    return new Promise((resolve, reject) =>{
        const sql = 'DELETE FROM seguiti WHERE id_utente=? AND corso_seguito=?'
        db.run(sql, [id_utente, id_corso], (err) => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}


//aggiungi il documento tra i preferiti
exports.addInLiked = function (id_utente, id_documento){
    return new Promise((resolve, reject) =>{
        const sql = 'INSERT INTO preferiti ("id_utente", "id_doc_pref") VALUES (?, ?)'
        db.run(sql, [id_utente, id_documento], (err) => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}

//rimuove il documento tra i preferiti
exports.deteleInLiked = function (id_utente, id_documento){
    return new Promise((resolve, reject) =>{
        const sql = 'DELETE FROM preferiti WHERE id_utente=? AND  id_doc_pref=?'
        db.run(sql, [id_utente, id_documento], (err) => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        })
    })
}

//restituisce tutte le donazioni di un utente 
exports.userDonationReport = function(id_utente){
    return new Promise((resolve, reject) =>{
        const sql =`SELECT corsi.id_corso as id_corso, titolo_corso, utenti.username, importo 
                    FROM donazioni 
                    LEFT JOIN corsi ON donazioni.id_corso=corsi.id_corso 
                    INNER JOIN utenti ON donazioni.id_utente=utenti.id_utente 
                    WHERE donazioni.id_utente=?;`;
        
        db.all(sql, [id_utente], (err, result) =>{
            if(err){
                reject(err);
                return;
            }
            const report = result.map((x) => ({id_corso:x.id_corso, corso:x.titolo_corso, utente:x.username, importo:x.importo}));
            resolve(report); 
        })
    })
}


//stampa il report di tutti i corsi seguiti dall'utente
exports.getPersonalSeguiti = function(id_utente){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM seguiti WHERE id_utente = ?';
        db.all(sql, [id_utente], (err, rows) => {
            if(err){
                resolve(err);
            }
            const personalSeguiti = rows.map((e) => ({id: e.id_seguito, utente: e.id_utente, corso: e.id_corso}));
            resolve(personalSeguiti);
        })
    })
}

//stampa i documenti relativi a un corso selezionato dalla home con i relativi like su un utente loggato
exports.getDocsAndLikes = function(id_utente, id_corso){ 
    return new Promise ((resolve, reject) =>{
        const sql ='SELECT documenti.*, preferiti.* FROM documenti LEFT JOIN preferiti ON documenti.documenti.id_documento = preferiti.id_doc_pref AND preferiti.id_utente = ? WHERE documenti.id_del_corso = ? ';
        db.all(sql, [id_utente, id_corso], (err, rows) => {
            if(err){
                reject(err);
            }
            const documenti = rows.map((x) =>({id:x.id_documento, titolo:x.nome_documento, note:x.note_documento, percorso:x.percorso_documento, 
                id_corso:x.id_del_corso, autore:x.id_autore, pref:x.id_preferito, utente:x.id_utente, id_doc:x.id_doc_pref}));
            resolve(documenti)
    })
 })
}

//controlla se è già presente un commento con l'associazione utente-documento
exports.checkCommentByIdDocAndIdUser = function(id_doc, id_user){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM commenti WHERE id_documento=? AND id_utente=?';
        db.get(sql, [id_doc, id_user], (err, output) =>{
            if(err){
                reject(err);
            }
            resolve(output);
        })
    })
}


exports.checkUserInside = function(username){
    return new Promise((resolve, reject) =>{
        const sql ='SELECT username FROM utenti WHERE username=?';
        db.get(sql, [username], (err, result) =>{
            if(err){
                reject(err);
                return;
            }
            resolve(result);
        })
    })
}
