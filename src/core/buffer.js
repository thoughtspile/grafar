var isExisty = require('./misc.js').isExisty;
var wrapFn = require('./fn_utils.js').wrapFn;
var blockRepeat = require('../math/array_utils.js').blockRepeat;
var union = require('../math/set.js').union;
var pool = require('./pool');


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


module.exports = {
    Buffer2: Buffer,
    buffer: makeBuffer,
    map: Buffer.map,
    mapify: Buffer.mapify
};
