import { Pool } from './Pool';

export interface BufferLike {
    array: ArrayLike<number>;
    count: number;
    itemSize: number;
}

/**
 * Float32Array + length.
 * Удобно, потому что у Float32Array статичная длина, а хочется разделить
 *   аллоцированный размер массива и количество значимых элементов.
 */
export class Buffer {
    array: Float32Array | Uint32Array = new Float32Array(0)
    count = 0
    itemSize = 1

    /**
     * Изменить размер буфера, чтобы в него влезало count * buffer.itemSize элементов
     * Работает для Three.Buffer и Buffer
     * Старый массив сдается в Pool, новый берется оттуда же.
     * Если размер не изменился, ничего не произойдет.
     */
    static resize(buffer: BufferLike, count: number) {
        const type: any = buffer.array.constructor;
        const length = count * buffer.itemSize;
        // TODO: Pool сам разрулит такой случай: сдал массив, получил его же.
        if (length !== buffer.array.length) {
            Pool.push(buffer.array);
            buffer.array = <any>Pool.get(type, length);
            if (buffer.hasOwnProperty('count')) {
                buffer.count = count;
            }
        }
    }

    /**
     * Шеллоу-копия
     */
    static assign(target: BufferLike, source: BufferLike) {
        target.array = source.array;
        target.count = source.count;
        target.itemSize = source.itemSize;
    }

    /**
     * Глубокая копия
     */
    static clone(target: BufferLike, source: BufferLike) {
        target.itemSize = source.itemSize;
        Buffer.resize(target, source.count);
        (<Float32Array>target.array).set(source.array);
    }
}
