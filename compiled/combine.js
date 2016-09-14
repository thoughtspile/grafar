'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.zip = exports.cart = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Set = require('./Set');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prod(arr) {
    return arr.reduce(function (acc, el) {
        return acc * el;
    }, 1);
}

function cart(comps, targ) {
    if (_lodash2.default.isUndefined(targ)) targ = new _Set.Set((0, _lodash2.default)(comps).invokeMap('getDims').sum());
    var srcData = _lodash2.default.invokeMap(comps, 'raw');
    var resSize = prod(_lodash2.default.invokeMap(comps, 'size'));
    targ.size(resSize);
    var targData = targ.raw();

    for (var iSet = 0, iComp = 0; iSet < comps.length; iSet++) {
        // each multiplier
        var rep = prod(comps.slice(0, iSet).map(function (c) {
            return c.size();
        }));
        var stretch = prod(comps.slice(iSet + 1).map(function (c) {
            return c.size();
        }));
        var compSize = comps[iSet].size();

        for (var iSetComp = 0; iSetComp < comps[iSet].getDims(); iSetComp++) {
            // each col in current multiplier
            var iEl = 0;
            for (var iRep = 0; iRep < rep; iRep++) {
                // repeat
                for (var iSrcEl = 0; iSrcEl < compSize; iSrcEl++) {
                    // each element
                    var el = srcData[iSet][iSetComp][iSrcEl];
                    for (var iStretch = 0; iStretch < stretch; iStretch++) {
                        // stretch
                        targData[iComp][iEl] = el;
                        iEl++;
                    }
                }
            }
            iComp++;
        }
    }

    return targ;
}

// shallow
function zip(comps, targ) {
    var dims = _lodash2.default.sum(_lodash2.default.map(comps, 'dims'));
    var size = _lodash2.default.min(_lodash2.default.map(comps, 'size'));
    if (!targ) targ = new _Set.Set(dims);
    targ._size = size;
    _lodash2.default.flatten(_lodash2.default.map(comps, '_cols')).forEach(function (col, i) {
        targ._cols[i] = col;
    });
    return targ;
}

exports.cart = cart;
exports.zip = zip;