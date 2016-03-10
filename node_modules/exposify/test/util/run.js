'use strict';

var browserify     = require('browserify')
  , vm             = require('vm')
  , exposify       = require('../../')

module.exports = function run(map, file, window, cb) {
  exposify.config = map;

  var ctx = { window: window };
  var fullPath = require.resolve('../fixtures/' + file);

  browserify()
    .require(fullPath)
    .transform(exposify)
    .bundle(function (err, res) {
      if (err) return cb(err);
      try {
        var require_ = vm.runInNewContext(res, ctx);
        cb(null, require_(fullPath));
      } catch (e) {
        cb(e);
      }
    });
}

