'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.each = exports.map = exports.Map = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Set = require('./Set');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// *** Helpers ***

function compileMap(fns) {
    var dimOut = fns.length;
    var compiled = fns.map(function (fn) {
        return wrapFn(fn, nListMap);
    });

    return function compiledMap(src, targ) {
        for (var i = 0; i < dimOut; i++) {
            compiled[i](src, targ[i]);
        }
    };
}

function compileEach(fn) {}

function wrapFn(fn, compiler) {
    var nargfn = nListMap(fn.length);
    return function wrappedFn(src, target) {
        return nargfn(fn, src, target);
    };
};

function repWithI(count, pattern) {
    var join = arguments.length <= 2 || arguments[2] === undefined ? ',' : arguments[2];

    return _lodash2.default.range(0, count).map(function (i) {
        return pattern(i);
    }).join(join);
}

function nListMap(nargs) {
    return new Function(['fn', 'src', 'target'], 'var len = (src[0] || target).length;\n' + 'for (var i = 0; i < len; i++)\n' + '  target[i] = fn(' + repWithI(nargs, function (i) {
        return 'src[' + i + '][i]';
    }, ',') + ');');
};

function nCall(nargs) {
    return new Function(['fn', 'src'], 'var len = src[0].length;\n' + 'for (var i = 0; i < len; i++)\n' + '  fn(' + repWithI(nargs, function (i) {
        return 'src[' + i + '][i]';
    }, ',') + ');');
}

// *** Exports ***

var Map = function () {
    function Map(fn) {
        _classCallCheck(this, Map);

        if (!Array.isArray(fn)) {
            fn = [fn];
        }

        this._dimOut = fn.length;
        this._compiled = compileMap(fn);
        this._cache = null;
        this._arg = null;
    }

    _createClass(Map, [{
        key: 'cache',
        value: function cache(cacheObj) {
            this._cache = cacheObj;
            return this;
        }
    }, {
        key: 'arg',
        value: function arg(argObj) {
            this._arg = argObj;
            return this;
        }
    }, {
        key: 'exec',
        value: function exec() {
            if (!this._cache) {
                this.cache(new _Set.Set(this._dimOut, this._arg.size()));
            }
            this._cache.size(this._arg.size());

            this._compiled(this._arg.raw(), this._cache.raw());

            return this._cache;
        }
    }, {
        key: 'free',
        value: function free() {
            return this.exec.bind(this);
        }
    }]);

    return Map;
}();

function map(src, fn, targ) {
    return new Map(fn).arg(src).cache(targ).exec();
}

function each(src, fn) {
    var compiled = nCall(src.getDims());
    compiled(fn, src.raw());
}

exports.Map = Map;
exports.map = map;
exports.each = each;