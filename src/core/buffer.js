(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // fn_utils
    var wrapFn = grafar.wrapFn;
    // array_utils
    var blockRepeat = grafar.blockRepeat;
    // set
    var union = grafar.union;


    function Buffer() {
        this.sources = [];
        this.array = new Float32Array(0);
        this.length = 0;
    }

    Buffer.map = function(params, target, fn) {
        wrapFn(fn)(params, target);
        return target;
    };

    // olny works for disjoint sum
    Buffer.prod = function(factors) {
        var targetSpace = new Buffer().depend(factors).getSpace();
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

    Buffer.prototype.resize = function (size) {
        var type = this.array.constructor;
        this.array = new Float32Array(size);
        this.length = size;
        return this;
    };


    grafar.Buffer2 = Buffer;
}(this));
