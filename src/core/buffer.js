import { grafar } from '../grafar';
import { wrapFn } from './fn_utils';
import { blockRepeat } from '../math/array_utils';
import { union } from '../math/set';

var c = 0;

function Buffer(type, length) {
    this.sources = [];
    this.id = c++;
    this.array = new (type || Float32Array)(length || 0);
    this.length = length;
}

Buffer.map = function(params, fn, target) {
    wrapFn(fn)(params, target);
    return target;
};

Buffer.mapify = function(fn) {
    var buffMap = wrapFn(fn);
    return function(params, target) {
        buffMap(params, target);
        return target;
    };
};

Buffer.prod = function(factors) {
    var targetSpace = new Buffer()
        .depend(factors)
        .getSpace()
        .sort(function(a, b) {
            return a.id > b.id;
        });
    var totalLength = targetSpace.reduce(function(pv, col) {
        return pv * col.length;
    }, 1);
    return factors.map(function(col) {
        var out = new Buffer().resize(totalLength).depend(factors);
        var blockSize = 1;
        var len = col.length;
        var res = out.array;
        res.set(col.array);
        targetSpace.forEach(function(targ) {
            if (col.getSpace().indexOf(targ) === -1) {
                blockRepeat(
                    res,
                    blockSize,
                    Math.floor(len / blockSize),
                    targ.length,
                    res
                );
                len *= targ.length;
            }
            blockSize *= targ.length;
        });
        return out;
    });
};


Buffer.prototype.getSpace = function() {
    if (this.sources.length === 0)
        return [this];
    else
        return this.sources.map(function(src) {
            return src.getSpace();
        }).reduce(function(pv, spc) {
            return union(pv, spc);
        }, []);
};

Buffer.prototype.depend = function(param) {
    this.sources = param.slice();
    return this;
};

Buffer.prototype.resize = function (length) {
    var type = this.array.constructor;
    if (this.array.length !== length)
        this.array = new type(length);
    this.length = length;
    return this;
};


grafar.Buffer2 = Buffer;
grafar.dir = Buffer.prod;
grafar.map = Buffer.map;
grafar.mapify = Buffer.mapify;
