function arraySum(a, b, out) {
    var l = a.length;
    for (var i = 0; i < l; i++)
        out[i] = a[i] + b[i];
}

function arrayTimes(n, b, out) {
    var l = b.length;
    for (var i = 0; i < l; i++)
        out[i] = n * b[i];
}

function repeatArray(arr, len, times) {
    var buff = arr.subarray(0, len),
        newlen = times * len;
    for (var i = len; i < newlen; i += len)
        arr.set(buff, i);
    return arr;
}

function repeatPoints(arr, len, times) {
    for (var i = len - 1, t = len * times - 1; i >= 0; i--) {
        var val = arr[i];
        for (var j = 0; j < times; j++, t--)
            arr[t] = val;
    }
    return arr;
}

function blockRepeat(source, blockSize: number, blockCount: number, repCount: number, target) {
    if (blockCount > 50) {
        for (var i = blockCount - 1; i >= 0; i--) {
            var baseS = i * blockSize;
            var baseTT = i * repCount;
            for (var k = 0; k < repCount; k++) {
                var baseT = (baseTT + k) * blockSize;
                for (var j = 0; j < blockSize; j++) {
                    target[baseT + j] = source[baseS + j];
                }
            }
        }
        return;
    }
    if (blockCount > 10) {
        const buffer = new Float32Array(blockSize);
        for (var i = blockCount - 1; i >= 0; i--) {
            for (var j = 0; j < blockSize; j++) {
                buffer[j] = source[i * blockSize + j];
            }
            var baseT = i * repCount * blockSize;
            for (var k = 0; k < repCount; k++) {
                target.set(buffer, baseT);
                baseT += blockSize;
            }
        }
        return;
    }
    for (var i = blockCount - 1; i >= 0; i--) {
        const buffer = source.subarray(i * blockSize, (i + 1) * blockSize);
        for (var k = 0; k < repCount; k++) {
            target.set(buffer, (i * repCount + k) * blockSize);
        }
    }
};

function incArray (arr, by: number) {
    for (var i = 0; i < arr.length; i++)
        arr[i] += by;
    return arr;
}

function timesArray (n: number, arr) {
    for (var i = 0; i < arr.length; i++)
        arr[i] *= n;
    return arr;
}

function Buffer() {
    this.array = new Float32Array(0);
    this.length = 0;
}


export {
    Buffer,
    arraySum,
    arrayTimes,
    incArray,
    timesArray,
    repeatArray,
    blockRepeat,
    repeatPoints
}
