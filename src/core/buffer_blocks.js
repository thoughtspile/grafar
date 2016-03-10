(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // buffer
    var Buffer = grafar.Buffer2;

    var range = function(a, b, n, buff) {
        buff = buff || new Buffer(Float32Array);
        buff.resize(n);

        var step = (b - a) / n;
        for (var i = 0; i < n; i++)
            buff.array[i] = a + i * step;

        return buff;
    };


    module.exports = {
        range: range
    };
}(this));
