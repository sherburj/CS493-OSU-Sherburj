const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const logger = require('./lib/logger');

const MongoClient  = require('mongodb').MongoClient;

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(logger);

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_DATABASE;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;

const mongoURL = `mongodb://root:password@localhost:${mongoPort}/mongodb`
console.log("== Mongo URL:", mongoURL);




/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});


MongoClient.connect(mongoURL, function (err, client) {
  if (!err) {
    console.log("Connected to Mongo with no error");
    app.locals.mongoDB = client.db(mongoDBName);
    app.listen(port, function() {
      console.log("== Server is running on port", port);
    });
  } else {
    console.log("err", err);
  }
});
