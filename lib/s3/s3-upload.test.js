/*global describe, it, after, before */

'use strict';

var fs = require('fs');
var Stream = require('stream');
var Readable = Stream.Readable;

var s3uploader = require('./s3-upload');

describe('S3 Uploader', function() {
  this.timeout(10000);
  it('Should upload to s3?', function(done) {
    var now = Date.now();
    var key = now + '.test';

    var rs = fs.createReadStream('test.txt');

    s3uploader.streamToS3(key, rs, {
      key: process.env.AWS_ACCESS,
      secret: process.env.AWS_SECRET,
      bucket: process.env.AWS_S3_BUCKET
    }).then(function(res) {
      console.log(res.Location);
      done();
    }, function(err) {
      done(err);
    });
  });
});
