/*global describe, it, before, after*/

'use strict';

var fs = require('fs');

var mongoDump = require('./mongo-dump');
var testUtils = require('../test-util');

var mongoUrl = 'mongodb://localhost:27017/dumptestdb';
var mongoCollection = 'dumptestcollection';

var collPromise = testUtils.getCollPromise(mongoUrl, mongoCollection);

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
   // var outStream = fs.createWriteStream(now + '.json');
   // stream.pipe(outStream);
  });

});
