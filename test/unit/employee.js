'use strict';

// Unit Testing
//
// Tests the smallest unit of functionality, typically a method/function 
// (e.g. given a class with a particular state, calling x method on the class 
// should cause y to happen). Unit tests should be focussed on one particular 
// feature (e.g., calling the pop method when the stack is empty should throw 
// an InvalidOperationException). Everything it touches should be done in 
// memory; this means that the test code and the code under test shouldn't:
//
// - Call out into (non-trivial) collaborators
// - Access the network
// - Hit a database
// - Use the file system
// - Spin up a thread
// - etc.

const assert = require('assert');
const Employee = require('../../models/employee').Employee;
const Flexitime = require('../../models/employee').Flexitime;

suiteSetup(function() {
  // Not used.
});
  
suite('Unit Test Suite', function() {
  
  suite('Employee model test', function() {
    setup(function() {
      // Not used.
    });
    
    test('Test the Employee model in isolation', function() {
      var employee = new Employee();
      employee.email = 'root@localhost';
      employee.firstname = 'Anne';
      employee.lastname = 'Example';
      employee.balance = 0;
      employee.isactive = true;
      
      assert.equal(employee.email, 'root@localhost');
      assert.equal(employee.firstname, 'Anne');
      assert.equal(employee.lastname, 'Example');
      assert.equal(employee.flexitimeaccrued.length, 0);
      assert.equal(employee.flexitimeused.length, 0);
      assert.equal(employee.balance, 0);
      assert.equal(employee.isactive, true);
    });
    
    teardown(function() {
      // Not used.
    });
  });
  
  suite('Flexitime model test', function() {
  
    setup(function() {
      // Not used.
    });
    
    test('Test the Flexitime model in isolation', function() {
      var flexitime = new Flexitime();
      flexitime.date = new Date('January 02, 2016 08:00:00');
      flexitime.duration = 60;
      flexitime.note = 'Started work one hour early.';
      
      assert.deepEqual(flexitime.date, new Date('January 02, 2016 08:00:00'));
      assert.equal(flexitime.duration, 60);
      assert.equal(flexitime.note, 'Started work one hour early.');
    });
    
    teardown(function() {
      // Not used.
    });
  });
  
  suite('Employee and Flexitime model test', function() {
  
    setup(function() {
      // Not used.
    });
    
    test('Test the Employee and Flextime integration', function() {
      var accrued1 = new Flexitime();
      accrued1.date = new Date('January 02, 2016 08:00:00');
      accrued1.duration = 60;
      accrued1.note = 'Started work one hour early.';
      
      var accrued2 = new Flexitime();
      accrued2.date = new Date('January 03, 2016 08:00:00');
      accrued2.duration = 60;
      accrued2.note = 'Started work one hour early.';
      
      var used1 = new Flexitime();
      used1.date = new Date('January 03, 2016 16:00:00');
      used1.duration = 60;
      used1.note = 'Finished work one hour early.';
      
      var used2 = new Flexitime();
      used2.date = new Date('January 04, 2016 16:30:00');
      used2.duration = 30;
      used2.note = 'Finished work 30 minutes early.';
      
      var employee = new Employee();
      employee.email = 'root@localhost';
      employee.firstname = 'Anne';
      employee.lastname = 'Example';
      employee.flexitimeaccrued.push(accrued1);
      employee.flexitimeaccrued.push(accrued2);
      employee.flexitimeused.push(used1);
      employee.flexitimeused.push(used2);
      employee.balance = 30;
      employee.isactive = true;
      
      // Now test
      var currentFlexitime = employee.flexitimeaccrued[0];
      assert.deepEqual(
        currentFlexitime.date,
        new Date('January 02, 2016 08:00:00'));
      assert.equal(currentFlexitime.duration, 60);
      assert.equal(currentFlexitime.note, 'Started work one hour early.');
      
      currentFlexitime = employee.flexitimeaccrued[1];
      assert.deepEqual(
        currentFlexitime.date, 
        new Date('January 03, 2016 08:00:00'));
      assert.equal(currentFlexitime.duration, 60);
      assert.equal(currentFlexitime.note, 'Started work one hour early.');
      
      currentFlexitime = employee.flexitimeused[0];
      assert.deepEqual(
        currentFlexitime.date, 
        new Date('January 03, 2016 16:00:00'));
      assert.equal(currentFlexitime.duration, 60);
      assert.equal(currentFlexitime.note, 'Finished work one hour early.');
      
      currentFlexitime = employee.flexitimeused[1];
      assert.deepEqual(
        currentFlexitime.date, 
        new Date('January 04, 2016 16:30:00'));
      assert.equal(currentFlexitime.duration, 30);
      assert.equal(currentFlexitime.note, 'Finished work 30 minutes early.');
    });
    
    teardown(function() {
      // Not used.
    });
  });
});

suiteTeardown(function() {
  // Not used.
});
