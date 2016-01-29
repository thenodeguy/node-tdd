'use strict';

var express = require('express');
var router = express.Router();
var Employee = require('../models/employee').Employee;

router.get('/employees', function(req, res, next) {
  Employee.find(function(err, employees) {
    if (err) {
      // This represents a real error (not an empty employees list, which will
      // not generate an error).
      res.status(500);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.json();
      return;
    }
    
    var response = {
      employees: employees,
    };
    
    res.status(200);
    res.set('Cache-Control', 'private, max-age=0, no-cache');
    res.json(response);
  });
});

router.get('/employees/:id', function(req, res, next) {

  Employee.findById(req.params.id, function(err, employee) {
    if (err) {
      // The resource cannot be found.
      res.status(404);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.json();
      return;
    }
    
    res.status(200);
    res.set('Cache-Control', 'private, max-age=0, no-cache');
    res.json(employee);
  });
});

router.post('/employees', function(req, res, next) {
  
  // Test the json is formatted correctly. This was actually done earlier by 
  // bodyParser. If the json was malformed, bodyParser will have thrown an 
  // error and this entire method will be bypassed.
  
  // Test the json includes name, price and description.
  var isMissingProperty = false;
  if (!req.body.hasOwnProperty('email')) {
    isMissingProperty = true;
  }
  
  if (!req.body.hasOwnProperty('firstname')) {
    isMissingProperty = true;
  }
  
  if (!req.body.hasOwnProperty('lastname')) {
    isMissingProperty = true;
  }
  
  if (isMissingProperty) {
    res.status(400);
    res.set('Cache-Control', 'private, max-age=0, no-cache');
    res.send();
    return;  
  }

  // All the conditions are satisifed. Save and return.
  var employee = new Employee();
  employee.email = req.body.email;
  employee.firstname = req.body.firstname;
  employee.lastname = req.body.lastname;
  
  employee.save(function(err, newEmployee) {
    if (err) {
      res.status(500);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.json();
      return;
    }
    
    res.status(200);
    res.set('Cache-Control', 'private, max-age=0, no-cache');
    res.json(newEmployee);
  });
});

router.put('/employees/:id', function(req, res, next) {

  Employee.findById(req.params.id, function(err, employee) {
    if (err) {
      // The resource cannot be found.
      res.status(404);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.json();
      return;
    }
    
    // Test the json is formatted correctly. This was actually done earlier by 
    // bodyParser. If the json was malformed, bodyParser will have thrown an 
    // error and this entire method will be bypassed.
    
    var isValidUpdate = false;
    if (req.body.hasOwnProperty('email')) {
      isValidUpdate = true;
      employee.email = req.body.email;
    }
    
    if (req.body.hasOwnProperty('firstname')) {
      isValidUpdate = true;
      employee.firstname = req.body.firstname;
    }
    
    if (req.body.hasOwnProperty('lastname')) {
      isValidUpdate = true;
      employee.lastname = req.body.lastname;
    }
    
    // Test to ensure that at least one field has been updated.
    if (!isValidUpdate) {
      res.status(400);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.send();
      return;  
    }

    employee.save(function(err) {
      if (err) {
        res.status(500);
        res.set('Cache-Control', 'private, max-age=0, no-cache');
        res.json();
        return;
      }
      
      // Return idempotent success indicator. The action has been enacted but
      // the response does not have a body.
      res.status(204);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.json();
    });
  });
});

router.delete('/employees/:id', function(req, res, next) {
  Employee.findByIdAndRemove(req.params.id, function(err, employee) {
    if (err) {
      res.status(404);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.json();
      return;
    }
    
    if (employee === null) {
      // The resource cannot be found.
      res.status(404);
      res.set('Cache-Control', 'private, max-age=0, no-cache');
      res.json();
      return;
    }
    
    // Return idempotent success indicator. The action has been enacted but
    // the response does not have a body.
    res.status(204);
    res.set('Cache-Control', 'private, max-age=0, no-cache');
    res.json();
  });
});

module.exports = router;
