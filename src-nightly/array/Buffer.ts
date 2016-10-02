/**
 * Float32Array + length.
 * Удобно, потому что у Float32Array статичная длина, а хочется разделить
 *   аллоцированный размер массива и количество значимых элементов.
 */
export class Buffer {
    array = new Float32Array(0)
    length = 0
}
