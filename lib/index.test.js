/*global describe, it, before, after*/

'use strict';

var request = require('request');

var testUtils = require('./test-util');
var mds = require('../index.js');

var mongoUrl = 'mongodb://localhost:27017/dumptestdb';
var mongoCollection = 'dumptestcollection';

var collPromise = testUtils.getCollPromise(mongoUrl, mongoCollection);

describe('Integration!', function() {

  var now = Date.now();

  before(function(done) {
    collPromise.then(function(collection) {
      collection.insert({a: now}, function(err, result) {
        done(err);
      });
    });
  });

  after(function(done) {

  });


  it('Should dump to s3', function(done) {
    var key = now + '.backup.json';
    var stream = mds.getMongoStream(mongoUrl, mongoCollection);

    function awsSuccess(res) {
      // Delete data from mongo
      collPromise.then(function(collection) {
        collection.remove({a: now}, function(err, res) {
          done(err);
        });
      });

      request(res.Location, function(err, resp, body) {
        if(err) { done(err); }

        if (resp.statusCode === 200) {

          /*
            //Cleanup after test
            testUtils.deleteS3Object(key)
              .then(function() {
                done();
              }, function(err) {
                console.log('Could not remove ', key, ' from s3');
                done(err);
              });
              */

        }
      });
    }

    function awsFail(err) {
      console.log('fail', err);
      done(err);
    }

    mds.streamToS3(key, stream, {
      key: process.env.AWS_ACCESS,
      secret: process.env.AWS_SECRET,
      bucket: process.env.AWS_S3_BUCKET
    }).then(awsSuccess, awsFail);
  });
});
