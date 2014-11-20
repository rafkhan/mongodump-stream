'use strict';

var mongoDump = require('./lib/mongo-dump/mongo-dump');
var s3upload  = require('./lib/s3/s3-upload');

exports = module.exports = {
  getMongoStream: mongoDump.getDumpStream,
  streamToS3: s3upload.streamToS3
};

