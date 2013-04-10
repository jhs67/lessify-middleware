
var fs = require('fs');
var path = require('path');
var compiler = require('./lib/compiler');

exports = module.exports = lessify;
function lessify(src, opts) {
	if (path.resolve(src) === path.normalize(src)) {
		src = path.normalize(src);
	}

	if (fs.statSync(src).isDirectory())
		return directory(src, opts);
	else
		return file(src, opts);
}

function defaults(opts) {
	var production = process.env.NODE_ENV === 'production'
	var r = {
		compress: opts && opts.compress != null ? opts.compress : production,
		cache: opts && opts.cache != null ? opts.cache : production,
		gzip: opts && opts.gzip != null ? opts.gzip : true,
		paths: opts && opts.paths,
	};
	if (typeof r.cache === 'number') r.cache = "public, max-age=" + r.cache;
	else if (r.cache == true) r.cache = "public, max-age=60";
	return r;
}

function file(src, opts) {
	opts = defaults(opts);
	return function(req, res, next) {
		compiler(src, defaults(opts), req, res, next);
	};
}

function directory(src, opts) {
	opts = defaults(opts);
	return function(req, res, next) {
		if (/\.css$/.test(req.path)) {
			var net = path.join(src, req.path.substring(0, req.path.length - 3) + "less");
			fs.stat(net, function (err, stat) {
				if (err || !stat.isFile()) return next();
				compiler(net, opts, req, res, next);
			});
		} else {
			return next();
		}
	};
}
