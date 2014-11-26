'use strict';

var mongoDump = require('./lib/mongo-dump/mongo-dump');
var s3upload  = require('./lib/s3/s3-upload');
var fsDumpFile = require('./lib/fs-dump/file');

exports = module.exports = {
  slurp: {
    binary: mongoDump.getBinaryDumpStream,
    text: mongoDump.getTextDumpStream,
    multiBinary: mongoDump.multiBinary
  },
  
  dump: {
    s3: s3upload.streamToS3,
    fs: {
      file: fsDumpFile.streamToFile
    }
  }
};

