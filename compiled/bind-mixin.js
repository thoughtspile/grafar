'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Tick = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.volatile = volatile;
exports.bind = bind;

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _counter = 0;
var _actions = [];
var last = null;

var Tick = exports.Tick = function () {
    function Tick() {
        _classCallCheck(this, Tick);
    }

    _createClass(Tick, null, [{
        key: 'on',
        value: function on(fn) {
            _actions.push(fn);
        }
    }, {
        key: 'off',
        value: function off(fn) {
            var iFn = _actions.indexOf(fn);
            if (iFn === -1) return;
            _actions.splice(iFn, 1);
        }
    }, {
        key: 'execute',
        value: function execute() {
            _counter++;
            last = Date.now();
            _actions.forEach(function (fn) {
                return fn();
            });
        }
    }]);

    return Tick;
}();

var run = typeof window !== 'undefined' ? function (fn) {
    return window.requestAnimationFrame(fn);
} : function (fn) {
    return setTimeout(fn, 16);
};

(function alwaysTick() {
    Tick.execute();
    run(alwaysTick);
})();

function bindConst(arg) {
    var boundfn = function boundfn() {
        return arg;
    };
    boundfn.updatedAt = function () {
        return -Infinity;
    };
    boundfn._isBound = true;

    return boundfn;
}

function volatile(arg) {
    var boundfn = function boundfn() {
        return arg;
    };
    boundfn.updatedAt = function () {
        return _counter;
    };
    boundfn._isBound = true;

    return boundfn;
}

/*
 */
function bind(fn) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    if (!fn) {
        if (args.length > 1) {
            throw new Error('Can\'t const-bind multiple args');
        }
        if (args[0]._isBound) {
            return args[0];
        }
        return bindConst(args[0]);
    }

    var liftedArgs = args.map(function (arg) {
        return bind(null, arg);
    });
    var _updatedTick = -Infinity;
    var res = void 0;
    var forceUpdate = true;
    var parentUpdatedAt = function parentUpdatedAt() {
        return _.max(liftedArgs.map(function (arg) {
            return arg.updatedAt();
        }));
    };
    var isValid = function isValid() {
        return _updatedTick >= parentUpdatedAt();
    };

    var boundfn = function boundfn() {
        if (forceUpdate || !isValid()) {
            res = fn.apply(null, liftedArgs.map(function (lift) {
                return lift();
            }));
            _updatedTick = _counter;
            forceUpdate = false;
        }
        return res;
    };
    boundfn.updatedAt = function () {
        return Math.max(parentUpdatedAt(), _updatedTick);
    };
    boundfn._isBound = true;
    boundfn.invalidate = function () {
        forceUpdate = true;
    };

    return boundfn;
}