'use strict';

const sqlite = require('sqlite3');

const db = new sqlite.Database('serverDatabase.db', (err) => 
{
  if (err) throw err;
});


db.serialize(() => {
    // Esecuzione del codice SQL per creare la tabella "utenti"
    db.run(`
      CREATE TABLE IF NOT EXISTS utenti (
        id_utente INTEGER NOT NULL UNIQUE,
        password TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        admin INTEGER NOT NULL,
        portrait TEXT DEFAULT '/images/defaultUser.png',
        PRIMARY KEY(id_utente AUTOINCREMENT)
      )
    `);
    // Creazione della tabella "preferiti" se non esiste già
    db.run(`CREATE TABLE IF NOT EXISTS preferiti (
      id_preferito INTEGER NOT NULL PRIMARY KEY,
      id_utente INTEGER NOT NULL,
      id_doc_pref INTEGER NOT NULL,
      FOREIGN KEY (id_utente) REFERENCES utenti (id_utente) ON UPDATE CASCADE ON DELETE CASCADE
    )`);
    // Creazione della tabella "corsi" se non esiste già
    db.run(`CREATE TABLE IF NOT EXISTS corsi (
      id_corso INTEGER PRIMARY KEY AUTOINCREMENT,
      titolo_corso TEXT NOT NULL,
      img_corso TEXT NOT NULL,
      descrizione_corso TEXT NOT NULL,
      categoria_corso TEXT NOT NULL,
      autore TEXT NOT NULL,
      FOREIGN KEY (autore) REFERENCES utenti (username) ON UPDATE CASCADE ON DELETE CASCADE
    )`);
    // Esecuzione del codice SQL per creare la tabella "documenti"
    db.run(`
      CREATE TABLE IF NOT EXISTS documenti (
        id_documento INTEGER NOT NULL UNIQUE,
        nome_documento TEXT NOT NULL,
        note_documento TEXT NOT NULL,
        percorso_documento TEXT DEFAULT '/',
        id_del_corso INTEGER NOT NULL,
        id_autore INTEGER NOT NULL,
        PRIMARY KEY(id_documento AUTOINCREMENT),
        FOREIGN KEY(id_del_corso) REFERENCES corsi(id_corso) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY(id_autore) REFERENCES utenti(id_utente) ON UPDATE CASCADE ON DELETE CASCADE
      )
    `);
    // Esecuzione del codice SQL per creare la tabella "seguiti"
    db.run(`
    CREATE TABLE IF NOT EXISTS seguiti (
      id_seguito INTEGER NOT NULL UNIQUE,
      id_utente INTEGER NOT NULL,
      corso_seguito INTEGER NOT NULL,
      FOREIGN KEY(corso_seguito) REFERENCES corsi(id_corso) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY(id_utente) REFERENCES utenti(id_utente) ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY(id_seguito AUTOINCREMENT)
    )
  `);
  // Esecuzione del codice SQL per creare la tabella "donazioni"
  db.run(`
  CREATE TABLE IF NOT EXISTS donazioni (
    id_donazione INTEGER NOT NULL UNIQUE,
    id_utente INTEGER NOT NULL,
    id_corso INTEGER NOT NULL,
    importo INTEGER NOT NULL,
    PRIMARY KEY(id_donazione AUTOINCREMENT),
    FOREIGN KEY(id_utente) REFERENCES utenti(id_utente) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(id_corso) REFERENCES corsi(id_corso) ON UPDATE CASCADE ON DELETE CASCADE
  )
  `);
  // Esecuzione del codice SQL per creare la tabella "commenti"
  db.run(`
      CREATE TABLE IF NOT EXISTS commenti (
        id_commento INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        id_utente INTEGER NOT NULL,
        id_documento INTEGER NOT NULL,
        contenuto_commento TEXT NOT NULL,
        FOREIGN KEY(id_documento) REFERENCES documenti(id_documento) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY(id_utente) REFERENCES utenti(id_utente) ON UPDATE CASCADE ON DELETE CASCADE
      )
    `);
  });
  
module.exports = db;

