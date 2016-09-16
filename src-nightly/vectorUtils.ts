function zeroVector(len) {
    var zero = [];
    for (var i = 0; i < len; i++)
        zero[i] = 0;
    return zero;
}

function dot(a, b) {
    var temp = 0,
        l = a.length;
    for (var i = 0; i < l; i++)
        temp += a[i] * b[i];
    return temp;
}

function norm(a) {
    var aNorm = 0,
        l = a.length;
    for (var i = 0; i < l; i++)
        aNorm += Math.abs(a[i]);
    return aNorm;
}

function norm2(a) {
    var aNorm2 = 0,
        l = a.length;
    for (var i = 0; i < l; i++)
        aNorm2 += a[i] * a[i];
    aNorm2 = Math.sqrt(aNorm2);
    return aNorm2;
}

function dist(a, b) {
    var abDist = 0,
        l = a.length;
    for (var i = 0; i < l; i++)
        abDist += Math.abs(a[i] - b[i]);
    return abDist;
}

export {
    zeroVector,
    dot,
    norm,
    norm2,
    dist
}
