import { Buffer } from './buffer';

function range(a, b, n) {
    var buff = new Buffer(Float32Array).resize(n);
    var step = (b - a) / n;
    for (var i = 0; i < n; i++) {
        buff.array[i] = a + i * step;
    }
    return buff;
};

export { range }
