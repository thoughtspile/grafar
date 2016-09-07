'use strict';

var _bufferNd = require('./buffer-nd');

var _bufferNd2 = _interopRequireDefault(_bufferNd);

var _generators = require('./generators');

var _transforms = require('./transforms');

var _combine = require('./combine');

var _bindMixin = require('./bind-mixin');

var _microseconds = require('microseconds');

var _microseconds2 = _interopRequireDefault(_microseconds);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var grafar = {
    version: '3.0.0',

    ints: _generators.ints,

    set: function set(arr) {
        var immutable = arr.slice();
        var size = arr.length;
        return new _generators.Generator(function (i) {
            return immutable[i];
        }).into(new _bufferNd2.default(1, size));
    },

    range: function range(start, end, size) {
        var step = (end - start) / (size - 1);
        return new _generators.Generator(function (i) {
            return start + step * i;
        }).into(new _bufferNd2.default(1, size));
    },

    map: function map(sources, fn) {
        throw new Error('map not ready');
    },

    cart: function cart(comps) {
        var dim = comps.length;
        return (0, _bindMixin.bind)(_combine.cart, comps, new _bufferNd2.default(dim)); // autocache
    },

    Set: _bufferNd2.default
};

if (typeof window !== 'undefined') {
    window.grafar = grafar;
}

module.exports = grafar;