'use strict';

var assert = require('assert');

function RequireChecker (code) {
  this.code = code;
}

RequireChecker.prototype.has = function hasRequire (id) {
  assert(id, 'module id is required');
  var regex = new RegExp('require\\(\\s*[\'"]' + id + '[\'"]\\s*\\)');
  return regex.test(this.code);
};

module.exports = RequireChecker;
