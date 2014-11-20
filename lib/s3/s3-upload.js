'use strict';

var q = require('q');
var knox = require('knox');
var MultiPartUpload = require('knox-mpu');

var mongoDump = require('../mongo-dump/mongo-dump');

var s3uploader = {};


// TODO implement as stream
s3uploader.streamToS3 = function(key, stream, awsConf) {
  var d = q.defer();

  var client = knox.createClient(awsConf);
  
  var upload = new MultiPartUpload({
    client: client,
    objectName: key, // Amazon S3 object name
    stream: stream,
    noDisk: true,
    partSize: 5242880,
    agent: false
  }, function(err, val) {
    if(err) {
      d.reject(err);
    } else {
      d.resolve(val);
    }
  });

  return d.promise;
};

exports = module.exports = s3uploader;
