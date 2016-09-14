'use strict';

var _Set = require('./Set');

var _generators = require('./generators');

var _transforms = require('./transforms');

var _combine = require('./combine');

var _bindMixin = require('./bind-mixin');

var _microseconds = require('microseconds');

var _microseconds2 = _interopRequireDefault(_microseconds);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var grafar = Object.freeze({
    version: '3.0.0',

    ints: _generators.ints,

    set: function set(arr) {
        var clone = arr.slice();
        var size = clone.length;
        return (0, _bindMixin.bind)(function (x) {
            return x;
        }, new _generators.Generator(function (i) {
            return clone[i];
        }).into(new _Set.Set(1, size)));
    },

    range: function range(start, end, size) {
        var step = (end - start) / (size - 1);
        return (0, _bindMixin.bind)(function (x) {
            return x;
        }, new _generators.Generator(function (i) {
            return start + step * i;
        }).into(new _Set.Set(1, size)));
    },

    point: function point(data) {
        var wrapper = new _Set.Set(1, 1);
        wrapper.raw()[0][0] = data;

        return (0, _bindMixin.bind)(function (x) {
            return x;
        }, wrapper);
    },

    map: function map(source, fn) {
        var compiledMap = new _transforms.Map(fn).arg(source()).cache(new _Set.Set(1));
        return (0, _bindMixin.bind)(function () {
            return compiledMap.exec();
        }, source);
    },

    cart: function cart(comps) {
        var dim = comps.length;
        return (0, _bindMixin.bind)(_combine.cart, comps, new _Set.Set(dim));
    },

    zip: _combine.zip
});

if (typeof window !== 'undefined') {
    window.grafar = grafar;
}

module.exports = grafar;