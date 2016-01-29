'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var dbConfig = require('./configs/db');
var mongoose = require('mongoose');

mongoose.connect(dbConfig[process.env.NODE_ENV].url);

// Close the database connection when Node process ends. 
process.on('SIGINT', function() {  
  mongoose.connection.close(function() {
    process.exit(0); 
  }); 
});

var app = express();

// Clients passing JSON to this application must specify their 'content-type'
// to be 'application/json', otherwise the data will not be formatted correctly
// and the application will return 400.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var employeeRoutes = require('./routes/employees');
app.use('/api/v1/', employeeRoutes);

// Called when no routes match the requested route.
app.use(function(req, res, next) {
  res.status(404);
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.json();
});

// Error handler.
app.use(function(err, req, res, next) {
  // Capture malformed JSON errors thrown by bodyParser.
  res.status(err.status || 'An error occurred.');
  res.set('Cache-Control', 'private, max-age=0, no-cache');
  res.json();
  return;
});

module.exports = app;
