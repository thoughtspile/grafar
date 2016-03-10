'use strict';

var path   =  require('path')
  , fs     =  require('fs')
  , exists =  fs.exists || path.exists
  ;

module.exports = function (currentFullPath, clue, cb) {

  function testDir(parts) {
    if (parts.length === 0) return cb(null, null);

    var p = path.join.apply(path, parts);

    exists(path.join(p, clue), function (itdoes) {
      if (itdoes) return cb(null, p);
      testDir(parts.slice(0, -1));
    });
  }

  testDir(currentFullPath.split(/(\/|\\)/));
};
