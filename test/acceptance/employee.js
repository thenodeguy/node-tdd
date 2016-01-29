'use strict';

// Acceptance Testing
//
// Standard acceptance testing involves performing tests on the full system 
// (e.g. using your web page via a web browser) to see whether the 
// application's functionality satisfies the specification. E.g. "clicking a 
// zoom icon should enlarge the document view by 25%."
//
// The advantage is that the tests are described in plain English and ensures 
// the software, as a whole, is feature complete.
//
// In agile software development, user acceptance testing involves creating 
// tests to mirror the user stories created by/for the software's customer 
// during development. If the tests pass, it means the software should meet 
// the customer's requirements and the stories can be considered complete. An 
// acceptance test suite is basically an executable specification written in a 
// domain specific language that describes the tests in the language used by 
// the users of the system.

const assert = require('assert');
const request = require('supertest');
const should = require('should');
const mongoose = require('mongoose');
const dbConfig = require('../../configs/db');
const appConfig = require('../../configs/app');
const Employee = require('../../models/employee').Employee;
const Flexitime = require('../../models/employee').Flexitime;

suiteSetup(function() {
  mongoose.connect(dbConfig[process.env.NODE_ENV].url);
  mongoose.connection.on('error', function(err) {
    console.log(err);
  });
});
  
suite('Acceptance Test Suite', function() {
  
  suite('Test getting employees when none exist', function() {
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
    
    test('Test', function(done) {
      request(appConfig[process.env.NODE_ENV].url)
        .get('/api/v1/employees')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.should.have.property('employees');
          res.body.employees.should.be.instanceof(Array).and.have.lengthOf(0);
          done();
        });
    });
    
    teardown(function(done) {
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
  });
  
  suite('Test getting employees when one exists', function() {
    
    setup(function(done) {
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
          return done(err);
        }
        done();
      });
    });
    
    test('Test', function(done) {
      request(appConfig[process.env.NODE_ENV].url)
        .get('/api/v1/employees')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.should.have.property('employees');
          res.body.employees.should.be.instanceof(Array).and.have.lengthOf(1);
          
          // Flexitime accrued tests
          var flexitime = res.body.employees[0].flexitimeaccrued[0];
          flexitime.duration.should.equal(60);
          flexitime.note.should.equal('Started work one hour early.');
          
          var expectedDate = new Date('January 02, 2016 08:00:00');
          flexitime.date.should.eql(expectedDate.toISOString());
          
          // Flextimeused tests
          flexitime = res.body.employees[0].flexitimeused[0];
          flexitime.duration.should.equal(60);
          flexitime.note.should.equal('Finished work one hour early.');
          
          expectedDate = new Date('January 03, 2016 16:00:00');
          flexitime.date.should.eql(expectedDate.toISOString());
          
          done();
        });
    });
    
    teardown(function(done) {
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
  });

  suite('Test creating a new employee', function() {
    
    setup(function(done) {
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
    
    test('Test', function(done) {
      var postData = {
        email: 'root@localhost',
        firstname: 'Ann',
        lastname: 'Other',
      };
      
      request(appConfig[process.env.NODE_ENV].url)
        .post('/api/v1/employees')
        .set('Accept', 'application/json')
        .send(postData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          
          res.body.email.should.equal('root@localhost');
          res.body.firstname.should.equal('Ann');
          res.body.lastname.should.equal('Other');
          done();
        });
    });
    
    teardown(function(done) {
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
  });
  
  suite('Test editing an existing employee', function() {
    
    var employeeId = null;
    
    setup(function(done) {
      var promise = new Promise(function(resolve, reject) {
      
        // Start with a clean slate.
        Employee.remove({}, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      })
      .then(function() {
      
        // Insert a new employee.
        return new Promise(function(resolve, reject) {
          var postData = {
            email: 'root@localhost',
            firstname: 'Adam',
            lastname: 'Adamson',
          };
      
          request(appConfig[process.env.NODE_ENV].url)
            .post('/api/v1/employees')
            .set('Accept', 'application/json')
            .send(postData)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return reject(err);
              }
              
              employeeId = res.body._id;
              resolve();
            });
        });
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        // Terminate the testing process.
        return done(err);
      });
    });
    
    test('Test', function(done) {
      var putData = {
        lastname: 'Adams',
      };
      
      request(appConfig[process.env.NODE_ENV].url)
        .put('/api/v1/employees/' + employeeId)
        .set('Accept', 'application/json')
        .send(putData)
        .expect(204, done);
    });
    
    teardown(function(done) {
      Employee.remove({}, function(err) {
        if (err) {
          // Terminate the testing process.
          return done(err);
        }
        done();
      });
    });
  });
  
  suite('Test deleting an existing employee', function() {
    
    var employeeId = null;
    
    setup(function(done) {
      var promise = new Promise(function(resolve, reject) {
      
        // Start with a clean slate.
        Employee.remove({}, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      })
      .then(function() {
      
        // Insert a new employee.
        return new Promise(function(resolve, reject) {
          var postData = {
            email: 'root@localhost',
            firstname: 'Karl',
            lastname: 'Karlsson',
          };
      
          request(appConfig[process.env.NODE_ENV].url)
            .post('/api/v1/employees')
            .set('Accept', 'application/json')
            .send(postData)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return reject(err);
              }
              
              employeeId = res.body._id;
              resolve();
            });
        });
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        // Terminate the testing process.
        return done(err);
      });
    });
    
    test('Test delete', function(done) {
    
      var promise = new Promise(function(resolve, reject) {
      
        // First attempt to delete the resource.
        request(appConfig[process.env.NODE_ENV].url)
          .del('/api/v1/employees/' + employeeId)
          .set('Accept', 'application/json')
          .expect(204)
          .end(function(err, res) {
            if (err) {
              return reject(err);
            }
            resolve();
          });
      })
      .then(function() {
      
        // Now retrieve all employees, which should be 0.
        return new Promise(function(resolve, reject) {
          request(appConfig[process.env.NODE_ENV].url)
            .get('/api/v1/employees')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                return reject(err);
              }
              
              res.body.should.have.property('employees');
              res.body.employees.should.be.instanceof(Array)
                .and.have.lengthOf(0);
              resolve();
            });
        });
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        return done(err);
      });
    });
    
    teardown(function(done) {
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
