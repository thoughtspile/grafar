(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // fn_utils
    var wrapFn = grafar.wrapFn;
    // array_utils
    var blockRepeat = grafar.blockRepeat;


    var counter = 0;

    function Buffer() {
        this.id = counter;
        counter++;
        this.array = new Float32Array(0);
        this.length = 0;
    }

    Buffer.map = function(params, target, fn) {
        wrapFn(fn)(params, target);
        return target;
    };

    // olny works for disjoint sum
    Buffer.prod = function(factors) {
        var targetBase = factors.slice();
        var targetIds = targetBase.map(function(col) { return col.id; });
        var totalLength = targetBase.reduce(function(pv, col) {
            return pv * col.length;
        }, 1);
        return factors.map(function(col) {
            var out = new Buffer().resize(totalLength);
            var blockSize = 1;
            var len = col.length;
            var res = out.array;
            res.set(col.array);
            targetBase.forEach(function(targ) {
                if (col.id !== targ.id) {
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


    Buffer.prototype.resize = function (size) {
        var type = this.array.constructor;
        this.array = new Float32Array(size);
        this.length = size;
        return this;
    };


    grafar.Buffer2 = Buffer;
}(this));
