/*global require*/

'use strict';

var q = require('q');
var R = require('ramda');
var spawn = require('child_process').spawn;
var mongoUri = require('mongo-uri');

var mongoDump = {};

function getSpawnArgs(uriData, collection) {
  var args = [];

  var host;
  if(uriData.ports[0]) {
    host = uriData.hosts[0] + ':' + uriData.ports[0];
  } else {
    host = uriData.hosts[0];
  }

  args.push('-h');
  args.push(host);

  if(uriData.username) {
    args.push('-u');
    args.push(uriData.username);
    args.push('-p');
    args.push(uriData.password); 
  }

  args.push('-d');
  args.push(uriData.database);

  if(collection) {
    args.push('-c');
    args.push(collection);
  }

  args.push('-o');
  args.push('-');

  return args;
}

function getDumpProcess(command, uri, collection) {
  var uriData = mongoUri.parse(uri);
  var args = getSpawnArgs(uriData, collection);

  var proc = spawn(command, args);
  proc.on('error', console.log);

  return proc;
}


function textDumpStream(mongoUri, collection) {
  var proc = getDumpProcess('mongoexport', mongoUri, collection);
  return proc.stdout;
}

function binaryDumpStream(mongoUri, collection) {
  var proc = getDumpProcess('mongodump', mongoUri, collection);
  return proc.stdout;
}


// handler must accept stream and return promise
// collections is an array
// 
function multiBinary(mongoUri, collections, handler) {
  var d = q.defer();
  var data = [];

  // TODO include ramda
  var promises = R.map(function(coll) {
    var stream = binaryDumpStream(mongoUri, coll);
    return handler(stream, coll)
      .then(function(val) {
        data.push(val);
      });
  }, collections);

  q.all(promises)
    .then(function() {
      d.resolve(data);
    });

  return d.promise;
}

mongoDump.getTextDumpStream = textDumpStream;
mongoDump.getBinaryDumpStream = binaryDumpStream;
mongoDump.multiBinary = multiBinary;

exports = module.exports = mongoDump; // jshint ignore:line

