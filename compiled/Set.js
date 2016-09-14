'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Set = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Buffer1d = require('./Buffer1d');

var _transforms = require('./transforms');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Set = function () {
    function Set() {
        var dims = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        _classCallCheck(this, Set);

        this._cols = _lodash2.default.range(dims).map(function () {
            return new _Buffer1d.Buffer1d(size);
        });
        this._size = size;
    }

    _createClass(Set, [{
        key: 'size',
        value: function size(_size) {
            if (_lodash2.default.isUndefined(_size)) return this._size;
            this._cols.forEach(function (buff) {
                return buff.size(_size);
            });
            this._size = _size;
            return this;
        }
    }, {
        key: 'getDims',
        value: function getDims() {
            return this._cols.length;
        }
    }, {
        key: 'raw',
        value: function raw() {
            return this._cols.map(function (col) {
                return col.raw();
            });
        }
    }, {
        key: 'map',
        value: function map(fn, targ) {
            return (0, _transforms.map)(this, fn, targ);
        }
    }, {
        key: 'each',
        value: function each(fn) {
            (0, _transforms.each)(this, fn);
            return this;
        }
    }]);

    return Set;
}();

exports.Set = Set;