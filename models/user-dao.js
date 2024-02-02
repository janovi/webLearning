'use strict';

const db = require('../db.js');
const bcrypt = require('bcrypt');




exports.getUserById = function(id) {
  return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM utenti WHERE id_utente = ?';
      db.get(sql, [id], (err, row) => {
          if (err) 
              reject(err);
          else if (row === undefined)
              resolve({error: 'User not found.'});
          else {
              const user = {id: row.id_utente, username: row.username}
              resolve(user);
          }
      });
  });
};

exports.getUser = function(username, password) {
  return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM utenti WHERE username = ?';
      db.get(sql, [username], (err, row) => {
          if (err) 
              reject(err);
          else if (row === undefined)
              resolve({error: 'User not found.'});
          else {
            const user = {id: row.id_utente, username: row.username};
            let check = false;
            
            if(bcrypt.compareSync(password, row.password))
              check = true;

            resolve({user, check});
          }
      });
  });
};


