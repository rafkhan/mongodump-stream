# Mongo Dump Streaming Utilities

Obtain a stream object from mongo's export utility.

Heavily based off [timisbusy/dumpstr](https://github.com/timisbusy/dumpstr)

## Documentation

`var mds = require('mongodump-stream');`

### API

##### `mds.slurp.binary(uri, collection)`
Get a binary stream of your collection (mongodump).

##### `mds.slurp.text(uri, collection)`
Get a textual stream of your collection (mongoexport).

##### `mds.dump.s3(key, stream, awsConf)`
Write an object named `key` to an S3 bucket using the data in `stream`.
`awsConf` must contain the properties `key`, `secret`, and `bucket`.

##### `mds.dump.fs.file(stream, path)`
Dump stream into path.




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
