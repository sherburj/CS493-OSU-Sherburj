const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST || 'mongo-server';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER || 'mongouser';
const mongoPassword = process.env.MONGO_PASSWORD || 'hunter2';
const mongoDBName = process.env.MONGO_DB_NAME || 'mongodb';

const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;
console.log("== Mongo URL:", mongoURL);

let db = null;

exports.connectToDB = function (callback) {
  MongoClient.connect(mongoURL, (err, client) => {
    db = client.db(mongoDBName);
    callback();
  });
};

exports.getDBReference = function () {
  return db;
};
