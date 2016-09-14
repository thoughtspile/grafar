'use strict';

var _Set = require('./Set');

var _generators = require('./generators');

var _microseconds = require('microseconds');

var _microseconds2 = _interopRequireDefault(_microseconds);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var time = function time(fn) {
    var start = _microseconds2.default.now();
    fn();
    return _microseconds2.default.since(start) / 1000;
};
var N = 2;
var bunch = function bunch(header, fn, each) {
    var sum = 0;
    for (var i = 0; i < N; i++) {
        var ms = time(fn);
        sum += ms;
        if (each) console.log(header, i, ':', ms);
    }
    console.log(header, ' AVG:', sum / N, '\n');
};

var buff = (0, _generators.ints)(0, 1000000);

bunch('ints', function () {
    return (0, _generators.ints)(20, 1000020, buff);
});
bunch('custom gen', function () {
    return _generators.Generator.into(function (i) {
        return i + 2;
    }, buff);
});
var val = 0;
var gen = new _generators.Generator(function (i) {
    return i + val;
});
bunch('prepared', function () {
    val++;gen.into(buff);
});