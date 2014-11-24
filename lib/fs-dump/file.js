'use strict';

var q = require('q');
var fs = require('fs');

function streamToFile(stream, fpath) {
  var d = q.defer();

  var outStream = fs.createWriteStream(fpath);
  stream.pipe(outStream);

  outStream.on('finish', function() {
    // TODO handle error case
    d.resolve();
  });

  return d.promise;
}

exports = module.exports = {
  streamToFile: streamToFile
};
