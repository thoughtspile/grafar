import { Pool } from './Pool';

export interface BufferLike {
    array: Float32Array;
    length: number;
}

/**
 * Float32Array + length.
 * Удобно, потому что у Float32Array статичная длина, а хочется разделить
 *   аллоцированный размер массива и количество значимых элементов.
 */
export class Buffer {
    array = new Float32Array(0)
    length = 0

    /**
     * Изменить размер буфера (работает для Three.Buffer и Buffer)
     * Старый массив сдается в Pool, новый берется оттуда же.
     * Если размер не изменился, ничего не произойдет.
     */
    static resize(buffer: BufferLike, size: number) {
        const type: any = buffer.array.constructor;
        // TODO: Pool сам разрулит такой случай: сдал массив, получил его же.
        if (size !== buffer.array.length) {
            Pool.push(buffer.array);
            buffer.array = <any>Pool.get(type, size);
            if (buffer.hasOwnProperty('length')) {
                buffer.length = size;
            }
        }
    }
}
