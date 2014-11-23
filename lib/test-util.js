'use strict';

var q = require('q');
var spawn = require('child_process').spawn;

var AWS = require('aws-sdk');
var MongoClient = require('mongodb').MongoClient;

var getConnection = q.denodeify(MongoClient.connect);

function getCollPromise(mongoUrl, mongoCollection) {
  return getConnection(mongoUrl).then(function(db) {
    return db.collection(mongoCollection);
  });
}

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

function deleteS3Object(key) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET
  });

  var s3 = new AWS.S3();

  var d = q.defer();
  var params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  s3.deleteObject(params, function(err, res) {
    if(err) { d.reject(err); }
    else { d.resolve(res); }
  });
  
  return d.promise;
}

function sprawn(cmd, args) {
  var d = q.defer();
  
  var proc = spawn(cmd, args);


  proc.on('close', function(code) {
    d.resolve(proc);
  });

  return d.promise;
}

function mongoRestore(args) {
  var d = q.defer();

  sprawn('mongorestore', args)
    .then(function(proc) {
      console.log('success');
    }, function(proc) {
      console.log('fail');
    });

  return d.promise;
}

exports = module.exports = {
  getCollPromise: getCollPromise,
  streamToString: streamToString,
  deleteS3Object: deleteS3Object,
  sprawn: sprawn
};
