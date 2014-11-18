/*global require*/

var q = require('q');
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

function getDumpProcess(uri, collection) {
  var uriData = mongoUri.parse(uri);
  var args = getSpawnArgs(uriData, collection);

  return spawn('mongodump', args);
}


function getDumpStream(mongoUri, collection) {
  var proc = getDumpProcess(mongoUri, collection);
  return proc.stdout;
}


mongoDump.getDumpProcess = getDumpProcess;
mongoDump.getDumpStream = getDumpStream;

exports = mongoDump; // jshint ignore:line

