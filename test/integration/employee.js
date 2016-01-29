'use strict';

// Integration
//
// Integration tests build on unit tests by combining the units of code and 
// testing that the resulting combination functions correctly. This can be 
// either the innards of one system, or combining multiple systems together to 
// do something useful. Also, another thing that differentiates integration 
// tests from unit tests is the environment. Integration tests can and will 
// use threads, access the database or do whatever is required to ensure that 
// all of the code and the different environment changes will work correctly. 

const assert = require('assert');
const mongoose = require('mongoose');
const dbConfig = require('../../configs/db');
const Employee = require('../../models/employee').Employee;
const Flexitime = require('../../models/employee').Flexitime;

suiteSetup(function() {
  mongoose.connect(dbConfig[process.env.NODE_ENV].url);
  mongoose.connection.on('error', function(err) {
    console.log(err);
  });
});
  
suite('Integration Test Suite', function() {
  
  suite('Test Employee Create', function() {
  
    setup(function(done) {
      // Start with a clean Employee collection.
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
    
    // Note the 'done' callback. This is required to test asynchronous code.
    test('Employee should be persisted to the database', function(done) {
      var accrued1 = new Flexitime();
      accrued1.date = new Date('January 02, 2016 08:00:00');
      accrued1.duration = 60;
      accrued1.note = 'Started work one hour early.';
      
      var used1 = new Flexitime();
      used1.date = new Date('January 03, 2016 16:00:00');
      used1.duration = 60;
      used1.note = 'Finished work one hour early.';
      
      var employee = new Employee();
      employee.email = 'root@localhost';
      employee.firstname = 'Anne';
      employee.lastname = 'Example';
      employee.flexitimeaccrued.push(accrued1);
      employee.flexitimeused.push(used1);
      employee.balance = 0;
      employee.isactive = true;
      
      employee.save(function(err, savedEmployee) {
        assert.equal(savedEmployee.firstname, 'Anne');
        assert.equal(savedEmployee.lastname, 'Example');
        assert.equal(savedEmployee.flexitimeaccrued.length, 1);
        assert.equal(savedEmployee.flexitimeused.length, 1);
        assert.equal(savedEmployee.balance, 0);
        assert.equal(savedEmployee.isactive, true);
        done();
      });
    });
    
    teardown(function(done) {
      // Clean up the collection again, ready for the next test.
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
  });
  
  suite('Test Employee Read', function() {
  
    var employeeId = null;
    
    setup(function(done) {
    
      // Start with a clean Employee collection.
      var promise = new Promise(function(resolve, reject) {
        Employee.remove({}, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      })
      .then(function() {
        // Insert an employee to later retrieve
        return new Promise(function(resolve, reject) {
          var accrued1 = new Flexitime();
          accrued1.date = new Date('January 02, 2016 08:00:00');
          accrued1.duration = 60;
          accrued1.note = 'Started work one hour early.';
          
          var used1 = new Flexitime();
          used1.date = new Date('January 03, 2016 16:00:00');
          used1.duration = 60;
          used1.note = 'Finished work one hour early.';
          
          var employee = new Employee();
          employee.email = 'root@localhost';
          employee.firstname = 'Anne';
          employee.lastname = 'Example';
          employee.flexitimeaccrued.push(accrued1);
          employee.flexitimeused.push(used1);
          employee.balance = 0;
          employee.isactive = true;
          
          employee.save(function(err, savedEmployee) {
            if (err) {
              return reject(err);
            }
            
            employeeId = savedEmployee._id;
            resolve();
          });
        });
      })
      .then(function() {
        // All finished.
        return done();
      })
      .catch(function(err) {
        // Terminate the testing process.
        return done(err);
      });
    });
    
    // Note the 'done' callback. This is required to test asynchronous code.
    test('Employee should be retrievable from the database', function(done) {
    
      Employee.findById(employeeId, function(err, retrievedEmployee) {
        assert.equal(retrievedEmployee.firstname, 'Anne');
        assert.equal(retrievedEmployee.lastname, 'Example');
        assert.equal(retrievedEmployee.balance, 0);
        assert.equal(retrievedEmployee.isactive, true);
        
        var flexitime = retrievedEmployee.flexitimeaccrued[0];
        assert.deepEqual(
          flexitime.date,
          new Date('January 02, 2016 08:00:00'));
        assert.equal(flexitime.duration, 60);
        assert.equal(flexitime.note, 'Started work one hour early.');
        
        flexitime = retrievedEmployee.flexitimeused[0];
        assert.deepEqual(
          flexitime.date,
          new Date('January 03, 2016 16:00:00'));
        assert.equal(flexitime.duration, 60);
        assert.equal(flexitime.note, 'Finished work one hour early.');
        
        done();
      });
    });
    
    teardown(function(done) {
      // Clean up the collection again, ready for the next test.
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
  });
});

suiteTeardown(function(done) {
  mongoose.disconnect(function(err) {
    if (err) {
      return done(err);
    }
    done();
  });
});
