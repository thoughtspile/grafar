'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Buffer1d = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ctor = Float32Array;

var Buffer1d = exports.Buffer1d = function () {
    function Buffer1d() {
        var size = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

        _classCallCheck(this, Buffer1d);

        this._data = new ctor(size);
        this._size = size;
    }

    _createClass(Buffer1d, [{
        key: 'size',
        value: function size(newSize) {
            if (_lodash2.default.isUndefined(newSize)) {
                return this._size;
            }

            if (newSize > this._size) {
                this._data = new ctor(newSize);
            }

            this._size = newSize;

            return this;
        }
    }, {
        key: 'raw',
        value: function raw() {
            return this._data;
        }
    }]);

    return Buffer1d;
}();