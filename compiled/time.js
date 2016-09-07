'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _buffer1d = require('./buffer-1d');

var _buffer1d2 = _interopRequireDefault(_buffer1d);

var _bufferNd = require('./buffer-nd');

var _bufferNd2 = _interopRequireDefault(_bufferNd);

var _transforms = require('./transforms');

var _generators = require('./generators');

var _combine = require('./combine');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var preMillion = (0, _generators.ints)(0, 1000000);

function run() {
    (0, _generators.ints)(0, 1000000, preMillion);
}

for (var i = 0; i < 100; i++) {
    run();
}if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== undefined) window.run = run;