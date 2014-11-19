'use strict';

var q = require('q');
var knox = require('knox');
var MultiPartUpload = require('knox-mpu');

var mongoDump = require('../mongo-dump/mongo-dump');

var s3uploader = {};

function ipromise(err, val) {
  var d = q.defer();
  
  if(err) {
    d.reject(err);
  } else {
    d.resolve(val);
  }

  return d.promise;
}

// TODO implement as stream
s3uploader.streamToS3 = function(key, stream, awsConf) {

  var client = knox.createClient(awsConf);
  
  var upload = new MultiPartUpload({
    client: client,
    objectName: key, // Amazon S3 object name
    stream: stream,
    noDisk: true,
    headers: {'x-amz-acl': 'private', 'Content-Type' :'binary/octet-stream' },
    partSize: 5242880,
    agent: false
  }, ipromise);
};

exports = s3uploader;
