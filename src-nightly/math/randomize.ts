/**
 * Заполнить l первых элементов массива arr случайными элементами на отрезке mean +- spread.
 * Если arr.length < l, то:
 *   - при arr instanceof Array: arr увеличится до размера l.
 *   - при arr instanceof TypedArray: arr заполнится до конца и функция будет работать медленно.
 */
export function randomize(arr, l: number, mean: number, spread: number) {
    for (var i = 0; i < l; i++) {
        arr[i] = mean + spread / 2 * (Math.random() + Math.random() - 1);
    }
}
