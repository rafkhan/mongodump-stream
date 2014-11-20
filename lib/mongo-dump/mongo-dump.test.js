/*global describe, it, before, after*/

'use strict';

var fs = require('fs');

var q = require('q');
var MongoClient = require('mongodb').MongoClient;
var mongoDump = require('./mongo-dump');

var mongoUrl = 'mongodb://localhost:27017/dumptestdb';
var mongoCollection = 'dumptestcollection';
var getConnection = q.denodeify(MongoClient.connect);

var collPromise = getConnection(mongoUrl).then(function(db) {
  return db.collection(mongoCollection);
});

function streamToString(stream) {
  var d = q.defer();

  var string = '';
  stream.on('readable', function() {
    var s = stream.read().toString();
    string += s;
  });

  stream.on('end', function() {
    d.resolve(string);
  });

  return d.promise;
}

describe('Mongo dump stream', function() {

  var now = Date.now();

  before(function(done) {
    collPromise.then(function(collection) {
      collection.insert({a: now}, function(err, result) {
        done(err);
      });
    });
  });

  after(function(done) {
    // mongoimport
    // make sure a == now
    collPromise.then(function(collection) {
      collection.remove({a: now}, function(err, res) {
        //TODO
        //
        //
      });
    });
  });

  it('Should get a dump stream', function(done) {
    var now = Date.now();
    var stream = mongoDump.getDumpStream(mongoUrl, mongoCollection);
    var outStream = fs.createWriteStream(now + '.json');
    stream.pipe(outStream);
  });

});
