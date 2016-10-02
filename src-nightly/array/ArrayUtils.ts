/** На самом деле любой типизированный массив, но в TS у них нет общего интерфейса) */
type TypedArray = Float32Array;

/**
 * Заполнить l первых элементов массива arr нулями.
 * Если arr instanceof Array и arr.length < l, arr увеличится до размера l.
 * Если arr instanceof TypedArray, то arr заполнится до конца и функция будет работать медленно.
 */
export function zeros(arr: number[] | TypedArray, l: number) {
    for (let i = 0; i < l; i++) {
        arr[i] = 0;
    }
    return arr;
};

/**
 * Умножить каждый элемент b на n, сложить результат в out.
 * b и out могут быть одним и тем же массивом.
 * Обрабатывает столько элементов, сколько есть в самом маленьком массиве, то есть
 *   `arrayTImes(3, [1], [])` ничего не сделает.
 */
export function arrayTimes(n: number, b: TypedArray, out: TypedArray) {
    const l = Math.min(b.length, out.length);
    for (let i = 0; i < l; i++) {
        out[i] = n * b[i];
    }
    return out;
}

/**
 * times раз повторить первые len элементов массива arr.
 * Например:
 *   repeatArray(new Float32Array([1, 2, 3, 4, 5]), 2, 2) == [1,2, 1,2, 5].
 * Если arr.length < length * times, arr заполнится до конца и функция будет работать медленно.
 */
export function repeatArray(arr: TypedArray, len: number, times: number) {
    const buff = arr.subarray(0, len);
    const newlen = times * len;
    for (let i = len; i < newlen; i += len) {
        arr.set(buff, i);
    }
    return arr;
}

/**
 * times раз повторить каждый из len первых элементов массива arr.
 * Например:
 *   repeatPoints(new Float32Array([1, 2, 3, 4, 5]), 2, 2) == [1,1, 2,2, 5].
 * Если arr.length < length * times, arr заполнится до конца и функция будет работать медленно.
 */
export function repeatPoints(arr: TypedArray, len: number, times: number) {
    for (let i = len - 1, t = len * times - 1; i >= 0; i--) {
        const val = arr[i];
        for (let j = 0; j < times; j++, t--) {
            arr[t] = val;
        }
    }
    return arr;
}

/**
 * Повторяет blockCount первых блоков по blockSize элементов из массива source по repCount раз.
 * Кладёт результат в target.
 * Возможно, важно, чтобы target и source были разными массивами.
 * Например, если
 *   arr = new Float32Array([1, 2, 3, 4, 5])
 *   blockSize = 2;
 *   blockCount = 2;
 * То блоки -- [1,2], [3,4]
 * А результат blockRepeat(arr, blockSize, blockCount, 3, ...) --
 *   [
 *     1,2, 1,2, 1,2,
 *     3,4, 3,4, 3,4
 *   ]
 */
export function blockRepeat(source: TypedArray, blockSize: number, blockCount: number, repCount: number, target: TypedArray) {
    // Это оптимизации между target.set(...) и поэлементным копированием в цикле.
    if (blockCount > 50) {
        for (let i = blockCount - 1; i >= 0; i--) {
            const baseS = i * blockSize;
            const baseTT = i * repCount;
            for (let k = 0; k < repCount; k++) {
                const baseT = (baseTT + k) * blockSize;
                for (let j = 0; j < blockSize; j++) {
                    target[baseT + j] = source[baseS + j];
                }
            }
        }
        return;
    }
    if (blockCount > 10) {
        const buffer = new Float32Array(blockSize);
        for (let i = blockCount - 1; i >= 0; i--) {
            for (let j = 0; j < blockSize; j++) {
                buffer[j] = source[i * blockSize + j];
            }
            let baseT = i * repCount * blockSize;
            for (let k = 0; k < repCount; k++) {
                target.set(buffer, baseT);
                baseT += blockSize;
            }
        }
        return;
    }
    for (let i = blockCount - 1; i >= 0; i--) {
        const buffer = source.subarray(i * blockSize, (i + 1) * blockSize);
        for (let k = 0; k < repCount; k++) {
            target.set(buffer, (i * repCount + k) * blockSize);
        }
    }
}

/**
 * Увеличить каждый элемент массива arr на by.
 * Например, incArray([ 1, 2 ], 3) == [ 4, 5 ]
 */
export function incArray(arr: TypedArray, by: number) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] += by;
    }
    return arr;
}
