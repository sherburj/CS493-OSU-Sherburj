/*
 * Review schema and data accessor methods.
 */
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const UserSchema = {
  userid: { required: false },
  name: { required: true },
  password: { required: true },
  email: { required: true },
  admin: { required: false }
};
exports.UserSchema = UserSchema;


function insertNewUser(user) {
  return bcrypt.hash(user.password, 8)
    .then((passwordHash) => {
      return new Promise((resolve, reject) => {
        const userValues = {
          name: user.name,
          password: passwordHash,
          email: user.email,
        };
        mysqlPool.query(
          'INSERT INTO users SET ?',
          userValues,
          function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result.insertId);
            }
          }
        );
      });
    });
}
exports.insertNewUser = insertNewUser;

function getUserByID(userID) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM users WHERE id = ?', [ userID ], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}
exports.getUserByID = getUserByID;


function getUserByEmail(userEmail) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
	'SELECT * FROM users WHERE email = ?',
	 [ userEmail ], 
	function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}
exports.getUserByEmail = getUserByEmail;



function deleteUserByID(id) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'DELETE FROM users WHERE id = ?',
      [ userID ],
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}
exports.deleteUserByID = deleteUserByID;

function updateUserByID(id, user) {
  return new Promise((resolve, reject) => {
    const userValues = {
	  id: null,
          name: user.name,
          email: user.email,
		  admin: user.admin
    };
    mysqlPool.query(
      'UPDATE users SET ? WHERE id = ?',
      [ userValues, id ],
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      }
    );
  });
}











