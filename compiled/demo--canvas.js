'use strict';

var _grafar = require('./grafar');

var grafar = _interopRequireWildcard(_grafar);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var x = grafar.range(0, 1, 10);
console.log(x().raw());

var y = grafar.map(x, function (x) {
  return 2 * x;
});
console.log(y().raw());