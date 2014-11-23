/*global describe, it, before, after*/

'use strict';

var fs = require('fs');
var q = require('q');

var mongoDump = require('./mongo-dump');
var testUtils = require('../test-util');

var mongoUrl = 'mongodb://localhost:27017/dumptestdb';
var mongoCollection = 'dumptestcollection';

var removeFn;
var insertFn;
var findOneFn;

var collPromise = testUtils.getCollPromise(mongoUrl, mongoCollection)
  .then(function(collection) {
    removeFn = q.nbind(collection.remove, collection);
    insertFn = q.nbind(collection.insert, collection);
    findOneFn = q.nbind(collection.findOne, collection);

    return collection;
  });


function loadIntoMongo(cmd, valId, now, args, done) {
  return function() {
    removeFn({})
      .then(function(res) {
        return findOneFn({});
      }, console.log)
  
      .then(function(doc) {
        if(doc) {
          throw 'Should not have found ' + doc;
        }

        return testUtils.sprawn(cmd, args);
      }, function(err) {
        console.log(err);
      })
      
      .then(function() {
        return findOneFn({});
      }, function(err) {
        console.log(cmd + ' failed', err);
      })

      .then(function(doc) {
        if(valId.toString() === doc._id.toString()) {
          done();
        } else {
          done('IDs do not match');
        }
      }, function(err) {
        console.log(':(', err);
      });
  };
}

describe('Mongo dump stream', function() {

  after(function(done) {
    removeFn({}).then(function() {
      done();
    });
  });

  it('Should get a text dump stream', function(done) {
    var valId;
    var now = Date.now();

    var args = ['--db', 'dumptestdb', '--collection',
      'dumptestcollection', '--file', now + '.json'];

    collPromise.then(function() {
      removeFn({}).then(function() {
        return insertFn({a: now});
      })
        .then(function(res){
          valId = res[0]._id;
         
          var stream = mongoDump.getTextDumpStream(mongoUrl, mongoCollection);
          var outStream = fs.createWriteStream(now + '.json');
          stream.pipe(outStream);

          outStream.on('finish', loadIntoMongo('mongoimport', valId, now, args, done));
        }, console.log);
    });
  });


  it('Should get a binary dump stream', function(done) {
    var valId;
    var now = Date.now();

    var args = ['--db', 'dumptestdb', '--collection',
      'dumptestcollection', now + '.bson'];

    collPromise.then(function() {
      removeFn({}).then(function() {
        return insertFn({a: now});
      }).then(function(res){
        valId = res[0]._id;
        
        var stream = mongoDump.getBinaryDumpStream(mongoUrl, mongoCollection);
        var outStream = fs.createWriteStream(now + '.bson');
        stream.pipe(outStream);

        outStream.on('finish', loadIntoMongo('mongorestore', valId, now, args, done));
      }, console.log);
    });
  });

});
