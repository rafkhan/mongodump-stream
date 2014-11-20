/*global describe, it, after, before */

'use strict';

var fs = require('fs');
var Stream = require('stream');
var Readable = Stream.Readable;

var request = require('request');

var s3uploader = require('./s3-upload');
var testUtils = require('../test-util');


describe('S3 Uploader', function() {

  this.timeout(3000);

  it('Should upload to s3?', function(done) {
    var now = Date.now();
    var key = now + '.test';

    var rs = fs.createReadStream(__dirname + '/test.txt');

    s3uploader.streamToS3(key, rs, {
      key: process.env.AWS_ACCESS,
      secret: process.env.AWS_SECRET,
      bucket: process.env.AWS_S3_BUCKET
    }).then(function(res) {
      request(res.Location, function(err, resp, body) {
        if(err) { done(err); }

        if (resp.statusCode === 200) {
          console.log(body);
          if(body === 'This is a test.\n') {

            //Cleanup after test
            testUtils.deleteS3Object(key)
              .then(function() {
                done();
              }, function(err) {
                console.log('Could not remove ', key, ' from s3');
                done(err);
              });

          } else {
            done(body);
          }
        }
      });
    }, function(err) {
      done(err);
    });
  });
});
