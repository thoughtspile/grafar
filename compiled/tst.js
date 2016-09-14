'use strict';

var _Buffer1d = require('./Buffer1d');

var _Set = require('./Set');

var _transforms = require('./transforms');

var _generators = require('./generators');

var _combine = require('./combine');

var _nanotimer = require('nanotimer');

var _nanotimer2 = _interopRequireDefault(_nanotimer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = console.log.bind(console);

var buff = new _Buffer1d.Buffer1d();
console.log(buff, buff.size());
buff.size(3);
console.log(buff, buff.size());

var set0d = new _Set.Set();
console.log(set0d, set0d.size());

var set2d = new _Set.Set(2);
console.log(set2d, set2d.size());
set2d.size(3);
console.log(set2d, set2d.size());

var comp1 = _generators.Generator.into(function (i) {
  return i + 1;
}, new _Set.Set(1, 3));
var comp2 = _generators.Generator.into(function (i) {
  return 10 * (i + 1);
}, new _Set.Set(1, 3));
(0, _combine.zip)([comp1, comp2], set2d);
console.log('zip: ', comp1.raw(), comp2.raw(), set2d.raw());

var set1d = new _Set.Set(1, 3);
(0, _transforms.map)(set2d, function (x, y) {
  return x + y;
}, set1d);
console.log('sum:', set1d.raw());

var targ2d = new _Set.Set(2, 3);
(0, _transforms.map)(set2d, [function (x, y) {
  return x + y;
}, function (x, y) {
  return x * y;
}], targ2d);
console.log('\n\tsum and product:');
console.log(targ2d.raw());

console.log('\n\t0..5');
(0, _transforms.each)((0, _generators.ints)(0, 5), log);

var int2 = (0, _generators.ints)(0, 1);
console.log('\n\t{0, 1}');
(0, _transforms.each)(int2, log);

console.log('\n\tdouble cube');
(0, _transforms.each)((0, _combine.cart)([int2, int2], new _Set.Set(2, 4)), log);

console.log('\n\ttriple cube');
var sqr3 = (0, _combine.cart)([int2, int2, int2], new _Set.Set(3, 8));
(0, _transforms.each)(sqr3, log);

console.log('\n\titerative triple cube');
var step1 = (0, _combine.cart)([int2, int2], new _Set.Set(2));
console.log('\nstep 1');
(0, _transforms.each)(step1, log);
var step2 = (0, _combine.cart)([step1, int2], new _Set.Set(3));
console.log('\nstep 2');
(0, _transforms.each)(step2, log);