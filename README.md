# Mongo Dump Streaming Utilities

Heavily based off [timisbusy/dumpstr](https://github.com/timisbusy/dumpstr)

### Example
```javascript
var mds = require('mongodump-stream');

var mongoUrl = 'mongodb://localhost:27017/YOUR-DB';
var mongoCollection = 'YOUR-COLLECTION';

var key = mongoCollection + '-' + Date.now() + '.backup';

var stream = mds.getMongoStream(mongoUrl, mongoCollection);

mds.streamToS3(key, stream, {
  key: process.env.AWS_ACCESS,
  secret: process.env.AWS_SECRET,
  bucket: process.env.AWS_S3_BUCKET
}).then(/* YOUR CALLBACKS */);
```
