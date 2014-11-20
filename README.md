# Mongo Dump Streaming Utilities

Obtain a stream object from mongo's export utility.

Heavily based off [timisbusy/dumpstr](https://github.com/timisbusy/dumpstr)

## Documentation

### API

##### `mds.getMongoStream(uri, collection)`
Get a stream of your collection.

##### `mds.streamToS3(key, stream, awsConf)`
Write an object named `key` to an S3 bucket using the data in `stream`.
`awsConf` must contain the properties `key`, `secret`, and `bucket`.

### Example
```javascript
var mds = require('mongodump-stream');

var mongoUrl = 'mongodb://localhost:27017/YOUR-DB';
var mongoCollection = 'YOUR-COLLECTION';

var fname = mongoCollection + '-' + Date.now() + '.backup';

var stream = mds.getMongoStream(mongoUrl, mongoCollection);

mds.streamToS3(fname, stream, {
  key: process.env.AWS_ACCESS,
  secret: process.env.AWS_SECRET,
  bucket: process.env.AWS_S3_BUCKET
}).then(/* YOUR CALLBACKS */);


//
// You could also write it to a file
//

var fs = require('fs');
var ws = fs.createWriteStream(fname);
stream.pipe(ws);
```
