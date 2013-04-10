
var fs = require('fs');
var zlib = require('zlib');
var crypto = require('crypto');
var less = require('less');

module.exports = compiler;
function compiler(src, opts, req, res, next) {
	cachedCompile(src, opts, function(err, css, gz, time, tag) {
		if (err) return next(err);

		if (!res.getHeader('Vary'))
			res.setHeader('Vary', 'Accept-Encoding');
		else if (res.getHeader('Vary').indexOf('Accept-Encoding') != -1)
			res.setHeader('Vary', res.getHeader('Vary') + ', Accept-Encoding');

		res.setHeader('content-type', 'text/css');

		if (req.headers['if-none-match'] === tag) {
			res.statusCode = 304;
			res.end();
			return;
		}

		res.setHeader('ETag', tag);
		res.setHeader('Last-Modified', time);

		if (opts.cache)
			res.setHeader('Cache-Control', opts.cache);

		if (opts.gzip && req.headers['accept-encoding'] && req.headers['accept-encoding'].indexOf('gzip') != -1) {
			res.setHeader('Content-Encoding', 'gzip');
			css = gz;
		}

		res.setHeader('Content-Length', css.length);

		if ('HEAD' === req.method)
			res.end();
		else
			res.end(css);
	})
}

var cache = {}

function cachedCompile(src, opts, next) {
	if (!opts.cache) return compile(src, opts, next);
	var c = cache[src];
	if (c) return next(null, c.css, c.gz, c.time, c.tag);
	compile(src, opts, function(err, css, gz, time, tag) {
		if (err) return next(err);
		var c = cache[src] = { css: css, gz: gz, time: time, tag: tag };
		return next(null, css, gz, time, tag);
	})
}

function compile(src, opts, next) {
	fs.readFile(src, 'utf8', function(err, content) {
		if (err) return next(err);
		var parser = new less.Parser({ filename: src, paths: opts.paths });
		parser.parse(content, function(err, tree) {
			if (err) return next(err);

			try {
				var css = tree.toCSS({ compress: opts.compress });
				var tag = crypto.createHash('md5').update(css).digest("hex");
			}
			catch(e) {
				return next(e);
			}

			if (!opts.gzip)
				return next(null, new Buffer(css), null, new Date().toUTCString(), tag);

			zlib.gzip(css, function(err, gz) {
				if (err) return next(err);
				return next(null, new Buffer(css), gz, new Date().toUTCString(), tag);
			});
		});
	});
}
