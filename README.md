# lessify-middleware

Express middleware to compile less files without littering up the file system with a lot of junk.

## Usage

```javascript
var lessify = require('lessify-middleware');
var express = require('express');
var app = express();

// provide compiled version of '.less' files in the directory
app.use('/style', lessify('/style/dir'));

// provide a compiled version of a particular file
app.use('/file.css', lessify('source/file.less'));

app.listen(1967);
````

## API

### `lessify('/path/to/file.less'[, options])`

Return middleware to serve a compiled version of the file.

### `lessify('/path/to/dir'[, options])`

Return middleware to serve compiled versions of all files in the directory.

### options / settings

The options passed to the middleware function will override the default settings:

#### cache

The cache settings controls the cache control header and in-memory caching of the compilation results.
If this is false or null, no caching will be done and no cache headers sent. Otherwise the compilation will
be cached and the this header will determine the 'Cache-Control' header.

#### compress

Passed to the less compiler to control the compression.

#### gzip

Control if the gzip transfer encoding is enabled.

#### paths

Passed to the less compiler to control the search path.

#### defaults

```javascript
{
  cache: process.env.NODE_ENV === 'production',
  compress: process.env.NODE_ENV === 'production',
  paths: null,
  gzip: true,
}
```

## License

  MIT
