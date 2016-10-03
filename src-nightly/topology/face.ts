import { GraphBuffer } from './GraphBuffer';
import { incArray, arrayTimes } from '../array/ArrayUtils';
import { cartesianGraphProd } from './cartesianGraphProd';

/**
 * makeFaces собирает GL face-index из массива граф-топологий.
 *   Face-index описывает, на какой тройке вершин нужно нарисовать треугольник. Это не совсем граф, но логика та же:
 *   [ v_11,v_12,v_13,  ..., v_n1,v_n2,v_n2 ], где v_ij -- номер вершины в position-буфере.
 *   Если у объекта, топологию которого сюда кладем, не 2 непрерывных измерения, результат пустой.
 *
 * src -- графы, которые перемножаем
 * target -- куда положить результат
 */
export function makeFaces(src: GraphBuffer[], target: GraphBuffer) {
    const nonEmpty = src.filter(src => src.count !== 0);

    if (nonEmpty.length !== 2) {
        GraphBuffer.resize(target, 0);
        return;
    }

    const leftStretch = src.slice(0, src.indexOf(nonEmpty[0]))
        .reduce((pv, cv) => pv * cv.pointCount, 1);
    const midStretch = src.slice(src.indexOf(nonEmpty[0]) + 1, src.indexOf(nonEmpty[1]))
        .reduce((pv, cv) => pv * cv.pointCount, 1);
    const rightStretch = src.slice(src.indexOf(nonEmpty[1]) + 1)
        .reduce((pv, cv) => pv * cv.pointCount, 1);

    const accum = new GraphBuffer(2, leftStretch);

    let edgeCount1 = nonEmpty[0].count;
    let nodeCount1 = nonEmpty[0].pointCount;
    let buffer = new Uint32Array(nonEmpty[0].array);

    GraphBuffer.resize(accum, edgeCount1 * leftStretch);
    accum.pointCount = leftStretch * nodeCount1;

    arrayTimes(leftStretch, buffer, buffer);
    for (var i = 0, pos = 0; i < leftStretch; i++, pos += 2 * edgeCount1) {
        accum.array.set(buffer, pos);
        incArray(buffer, 1);
    }

    edgeCount1 = accum.count;
    nodeCount1 = accum.pointCount;
    buffer = new Uint32Array(accum.array);

    GraphBuffer.resize(accum, edgeCount1 * midStretch);
    accum.pointCount = midStretch * nodeCount1;

    for (var i = 0, pos = 0; i < midStretch; i++, pos += 2 * edgeCount1) {
        accum.array.set(buffer, pos);
        incArray(buffer, nodeCount1);
    }

    accum.itemSize = 3;
    makeFaces2([accum, nonEmpty[1]], accum);

    if (rightStretch !== 1) {
        /** TODO: упаковать в функцию: это же просто повторение массива */
        let buffer = new Uint32Array(accum.array);
        GraphBuffer.resize(accum, accum.count * rightStretch);

        for (let i = 0, pos = 0; i < rightStretch; i++, pos += buffer.length) {
            accum.array.set(buffer, pos);
            incArray(buffer, accum.pointCount);
        }

        accum.pointCount *= rightStretch;
    }

    GraphBuffer.resize(target, accum.count);
    target.array.set(accum.array);
    target.pointCount = accum.pointCount;
};

/**
 * makeFaces2 собирает GL face-index из двух граф-топологий.
 *   Face-index описывает, на какой тройке вершин нужно нарисовать треугольник. Это не совсем граф, но логика та же:
 *   [ v_11,v_12,v_13,  ..., v_n1,v_n2,v_n2 ], где v_ij -- номер вершины в position-буфере.
 *
 * @param  {[GraphBuffer, GraphBuffer]} src два графа, которые перемножаем
 * @param  {type} target куда положить результат
 * @return {void}
 */
function makeFaces2(src: [GraphBuffer, GraphBuffer], target: GraphBuffer) {
    const arr1 = src[0].array;
    const edgeCount1 = src[0].count;
    const nodeCount1 = src[0].pointCount;
    const arr2 = src[1].array;
    const edgeCount2 = src[1].count;
    const nodeCount2 = src[1].pointCount;

    if (target.itemSize !== 3) {
        throw new Error('invalid face index array supplied: itemSize must be 3');
    }

    GraphBuffer.resize(target, edgeCount1 * edgeCount2 * 2);
    const targArray = target.array;
    target.pointCount = nodeCount1 * nodeCount2;

    let pos = 0;
    const buffer1 = new Uint32Array(arr1);
    for (var i = 0; i < edgeCount1; i++) {
        for (var j = 0; j < edgeCount2; j++) {
            const e1from = arr1[2 * i];
            const e1to = arr1[2 * i + 1];
            const e2from = arr2[2 * j];
            const e2to = arr2[2 * j + 1];

            targArray[pos] = e1from + e2from  * nodeCount1;
            targArray[pos + 1] = e1from + e2to  * nodeCount1;
            targArray[pos + 2] = e1to + e2to  * nodeCount1;
            pos += 3;

            targArray[pos] = e1from + e2from  * nodeCount1;
            targArray[pos + 1] = e1to + e2to  * nodeCount1;
            targArray[pos + 2] = e1to + e2from  * nodeCount1;
            pos += 3;
        }
    }
}
