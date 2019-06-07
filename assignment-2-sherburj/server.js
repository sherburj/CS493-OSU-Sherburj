const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const logger = require('./lib/logger');

const { connectToDB } = require('./lib/mongo');

const app = express();
const port = process.env.PORT || 8000;

const api = require('./api');

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(logger);


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

connectToDB(()=> {
  app.listen(port, function() {
    console.log("== Server is running on port", port);
  });
});
