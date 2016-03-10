var wrapFn = require('../fn_utils.js').wrapFn;
var blockRepeat = require('../math/array_utils.js').blockRepeat;
var union = require('../math/set.js').union;
var bufferMod = require('./buffer.js');
var Buffer = bufferMod.Buffer2;
var makeBuffer = bufferMod.buffer;


var c = 0;

var dir = function(factors) {
    var targetSpace = makeExtendedBuffer()
        .depend(factors)
        .getSpace()
        .sort(function(a, b) {
            return a.id > b.id;
        });
    var totalLength = targetSpace.reduce(function(pv, col) {
        return pv * col.length;
    }, 1);
    return factors.map(function(col) {
        var out = makeExtendedBuffer().resize(totalLength).depend(factors);
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

var TBuffer = function() {
    this.id = c++;
    this.sources = [];
};

var makeExtendedBuffer = function(/* ... */) {
    var temp = makeBuffer.apply(null, arguments);
    TBuffer.call(temp);
    temp.getSpace = TBuffer.prototype.getSpace;
    temp.depend = TBuffer.prototype.depend;
    return temp;
};


TBuffer.prototype.getSpace = function() {
    if (this.sources.length === 0)
        return [this];
    else
        return this.sources.map(function(src) {
            return src.getSpace();
        }).reduce(function(pv, spc) {
            return union(pv, spc);
        }, []);
};

TBuffer.prototype.depend = function(param) {
    this.sources = param.slice();
    return this;
};


module.exports = {
    dir: dir,
    buffer: makeExtendedBuffer
};
