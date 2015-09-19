(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // buffer
    var Buffer = grafar.Buffer2;

    var range = function(a, b, n) {
        var buff = new grafar.Buffer2(Float32Array).resize(n);
        var step = (b - a) / n;
        for (var i = 0; i < n; i++)
            buff.array[i] = a + i * step;
        return buff;
    };
    

    grafar.range = range;
}(this));
