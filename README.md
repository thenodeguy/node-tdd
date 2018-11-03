# node-tdd

[![Greenkeeper badge](https://badges.greenkeeper.io/bjvickers/node-tdd.svg)](https://greenkeeper.io/)

A basic and lean recipe for implementing TDD in Node.

Demonstrates unit, integration and acceptance testing using Mocha, assert and
Should.js.


Dependencies
-
git  
node.js 4.2.4+  
MongoDB


To install
-
```
$ mkdir -vp node-tdd  
$ cd node-tdd  
$ git clone https://github.com/thenodeguy/node-tdd.git .  
$ npm install
```
Check to ensure the default database connection details will work. These are 
held in <strong><code>configs/db.js</code></strong>. Modify them as necessary.


To test:
-
First start the REST server:
```
$ sudo npm start
```
Then, in a separate terminal, run the test suite:
```
$ npm test
```
