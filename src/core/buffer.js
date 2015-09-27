(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // misc
    var isExisty = grafar.isExisty;
    // fn_utils
    var wrapFn = grafar.wrapFn;
    // array_utils
    var blockRepeat = grafar.blockRepeat;
    // set
    var union = grafar.union;
    // pool
    var pool = grafar.pool;


    function Buffer(type, length) {
        if (typeof type === 'number' && !isExisty(length)) {
            length = type;
            type = Float32Array;
        }
        this.array = pool.get(type || Float32Array, length || 0);
        this.length = this.array.length;
    }

    function makeBuffer(type, length) {
        return new Buffer(type, length);
    };


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


    Buffer.prototype.reserve = function(length) {
        this.array = pool.swap(this.array, length);
        return this;
    };

    Buffer.prototype.resize = function (length) {
        if (this.array.length < length)
            this.array = pool.swap(this.array, length);
        this.length = length;
        return this;
    };


    grafar.Buffer2 = Buffer;
    grafar.buffer = makeBuffer;
    grafar.map = Buffer.map;
    grafar.mapify = Buffer.mapify;
}(this));
