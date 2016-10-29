import { Buffer } from '../../array/Buffer';

/**
 * Графы задают топологию объекта (какие вершины соединять отрезком).
 * Face-топология (треугольники, чтобы трехмерный объект не был вайрфреймным)
 *   где-то прикостыляна, но я не знаю точно, где.
 * Идея с array + length та же, что и у простого Buffer: отделение аллоцированного
 *   размера массива от используемого + совместимость с THREE.
 * pointCount -- число вершин в графе.
 * Данные хранятся в GL-формате: ребра (e_11, e_12), ..., (e_n1, e_n2) разложены
 *   в массиве как [e_11,e_12, ..., e_n1,e_n2]
 */
export class GraphBuffer extends Buffer {
    constructor(public itemSize: number, public pointCount = 0) {
        super();
    }

    array = new Uint32Array(this.count * this.itemSize)
}
