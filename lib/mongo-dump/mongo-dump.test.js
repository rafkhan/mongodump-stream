/*global describe, it, xit, before, after*/

'use strict';

var fs = require('fs');
var q = require('q');
var expect = require('chai').expect;

var mongoDump = require('./mongo-dump');
var testUtils = require('../test-util');
var fsDumpFile = require('../fs-dump/file');

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
         
          // I guess this tests the fs-dump?
          var stream = mongoDump.getTextDumpStream(mongoUrl, mongoCollection);
          fsDumpFile.streamToFile(stream, now + '.json')
            .then(function() {
              loadIntoMongo('mongoimport', valId, now, args, done)();
            }, console.log);

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

describe('Multiple collections', function() {

  before(function(done) {
    testUtils.getCollPromise(mongoUrl, 'multi_a')
      .then(function(coll) {
        coll.insert({a: Date.now()}, function(err) {
          if(err) { done(err); }

          testUtils.getCollPromise(mongoUrl, 'multi_b')
            .then(function(coll) {
              coll.insert({b: Date.now()}, function(err) {
                if(err) { done(err); }

                done(); // yay!!
              });
            });

        });
      });
  });



  it('Should create multiple files', function(done) {
    var i = 0;
    var names = [];
    mongoDump.multiBinary(mongoUrl, ['multi_a', 'multi_b'],
      function(stream, collName) {
        i++;
        var d = q.defer();
        var name = i + collName + '-binary.bson';
        names.push(name);
        d.resolve(name);
        return d.promise;
      }).then(function(data) {
        expect(data).to.contain(names[0]);
        expect(data).to.contain(names[1]);
        done();
      }).then(function(){}, console.log);
  });
});
