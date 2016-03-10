'use strict';

var Checker = require('./checker');

module.exports = function hasRequire (code, id) {
  return new Checker(code).has(id);
};

module.exports.Checker = Checker;
