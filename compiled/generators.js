'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Generator = exports.ints = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bufferNd = require('./buffer-nd');

var _bufferNd2 = _interopRequireDefault(_bufferNd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function mkGen() {
    // seed prevents premature inlining
    var seed = Math.floor(Math.random() * 10000);
    return Function(['fn', 'raw', 'size'], seed + '; for (var i = 0; i < size; i++) raw[i] = fn(i);');
}

var Generator = function () {
    function Generator(fn) {
        _classCallCheck(this, Generator);

        this.gen = mkGen();
        this.fn = fn;
    }

    _createClass(Generator, [{
        key: 'into',
        value: function into(set) {
            this.gen(this.fn, set.raw()[0], set.size());
            return set;
        }
    }], [{
        key: 'into',
        value: function into(fn, set) {
            mkGen()(fn, set.raw()[0], set.size());
            return set;
        }
    }]);

    return Generator;
}();

// thread-unsafe


var gens = {
    int: function () {
        var start = 0;
        var gen = new Generator(function (i) {
            return start + i;
        });
        return {
            setup: function setup(obj) {
                start = obj.start;
                return this;
            },
            into: gen.into.bind(gen)
        };
    }()
};

function ints(startLoc, end, targ) {
    var start = Math.ceil(startLoc);
    var size = Math.abs(Math.floor(end) + 1 - start);
    targ = targ ? targ.size(size) : new _bufferNd2.default(1, size);

    return gens.int.setup({ start: start }).into(targ);
}

exports.ints = ints;
exports.Generator = Generator;