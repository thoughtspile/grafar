import { GraphBuffer } from './GraphBuffer';
import { incArray, arrayTimes } from '../array/ArrayUtils';
import { Pool } from '../array/Pool';
import { Reactive } from '../Reactive';

/**
 * pathGraph кладет в target.array граф-путь на target.pointCount вершинах.
 *   Задаёт топологию свободного непрерывного измерения (отрезка).
 *   Например, граф-путь на 3 вершинах: [0,1, 1,2].
 *   target автоматически ресайзится до нужного размера, 2 * (target.pointCount - 1).
 *
 * @param  {Object} srcDummy для совместимости с сигнатурой генераторов графара. pathGraph задает топологию свободных измерений, так что в нормальной ситуации это пустой объект, но если нет, то ничего плохоо не случится.
 * @param  {GraphBuffer} target, в который кладется результат.
 * @return {void}
 */
export function pathGraph(srcDummy: any, target: GraphBuffer) {
    var edgeCount = target.pointCount - 1;
    GraphBuffer.resize(target, edgeCount * 2);
    var data = target.array;
    for (var i = 0, j = 0; i < edgeCount; i++, j += 2) {
        data[j] = i;
        data[j + 1] = i + 1;
    }
}


/**
 * emptyGraph кладёт в target.array пустой граф (то есть меняет размер на 0).
 *   Задаёт топологию свободного дискретного измерения (множества точек).
 *
 * @param  {Object} srcDummy для совместимости с сигнатурой генераторов графара.
 * @param  {GraphBuffer} target, в который кладётся результат.
 * @return {void}
 */
export function emptyGraph(srcDummy: any, target: GraphBuffer) {
    GraphBuffer.resize(target, 0);
}


/**
 * cartesianGraphProd2: декартово произведение двух графов. (https://en.wikipedia.org/wiki/Cartesian_product_of_graphs)
 *   Задает топологию декартова произведения двух измерений.
 *   Например, декартово произведение двух отрезков -- сетка, а отрезка и дискретного множества -- набор отрезков.
 *
 * @param  {[GraphBuffer, GraphBuffer]} src массив из двух GraphBuffer-ов, которые перемножаем
 * @param  {type} target куда кладем результат
 * @return {void}
 *
 * TODO: нужно выделять массивы не через конструктор, а брать в Pool
 * TODO: не уверен, но, возможно, операции на графах не реактивны, то есть нельзя динамически менять размер (количество точек) и топологию объектов.
 */
function cartesianGraphProd2(src: [GraphBuffer, GraphBuffer], target: GraphBuffer) {
    const arr1 = src[0].array;
    const edgeCount1 = src[0].length / 2;
    const nodeCount1 = src[0].pointCount;

    const arr2 = src[1].array;
    const edgeCount2 = src[1].length / 2;
    const nodeCount2 = src[1].pointCount;

    // reactive of course these should be!
    GraphBuffer.resize(target, (edgeCount1 * nodeCount2 + edgeCount2 * nodeCount1) * 2);
    target.pointCount = nodeCount1 * nodeCount2;

    let pos = 0;
    let buffer1 = new Uint32Array(arr1);
    for (let i = 0; i < nodeCount2; i++, pos += 2 * edgeCount1) {
        target.array.set(buffer1, pos);
        incArray(buffer1, nodeCount1);
    }

    let buffer2 = new Uint32Array(arr2);
    arrayTimes(nodeCount1, buffer2, buffer2);
    for (let i = 0; i < nodeCount1; i++, pos += 2 * edgeCount2) {
        target.array.set(buffer2, pos);
        incArray(buffer2, 1);
    }
};

/**
 * cartesianGraphProd декартово произведение n графов. (https://en.wikipedia.org/wiki/Cartesian_product_of_graphs)
 *   Задает топологию декартова произведения двух измерений.
 *   Например, декартово произведение двух отрезков -- сетка, а отрезка и дискретного множества -- набор отрезков.
 *
 * @param  {GraphBuffer[]} src графы, которые перемножаем
 * @param  {GraphBuffer} target куда положить результат
 * @return {void}
 *
 * TODO: как минимум, нужно выделять массивы не через конструктор, а брать в Pool.
 * TODO: в идеальном мире нужно явным образом обобщить алгоритм на n графов, а редьюсить по два.
 */
export function cartesianGraphProd(src: GraphBuffer[], target: GraphBuffer) {
    const accum: GraphBuffer = {
        array: new Uint32Array(0),
        pointCount: 1,
        length: 0
    };

    // редьюсим
    for (var i = 0; i < src.length; i++) {
        cartesianGraphProd2([accum, src[i]], accum);
    }

    // перекладываем в target
    GraphBuffer.resize(target, accum.length);
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
    const edgeCount1 = src[0].length / 2;
    const nodeCount1 = src[0].pointCount;
    const arr2 = src[1].array;
    const edgeCount2 = src[1].length / 2;
    const nodeCount2 = src[1].pointCount;

    // reactive of course these should be!
    GraphBuffer.resize(target, edgeCount1 * edgeCount2 * 2 * 3);
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

/**
 * makeFaces собирает GL face-index из массива граф-топологий.
 *   Face-index описывает, на какой тройке вершин нужно нарисовать треугольник. Это не совсем граф, но логика та же:
 *   [ v_11,v_12,v_13,  ..., v_n1,v_n2,v_n2 ], где v_ij -- номер вершины в position-буфере.
 *   Если у объекта, топологию которого сюда кладем, не 2 непрерывных измерения, результат пустой.
 *
 * @param  {GraphBuffer[]} src графы, которые перемножаем
 * @param  {type} target куда положить результат
 * @return {void}
 */
export function makeFaces(src: GraphBuffer[], target) {
    const nonEmpty = src.filter(src => src.length !== 0);

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

    const accum = {
        array: new Uint32Array(0),
        pointCount: leftStretch,
        length: 0
    };

    let edgeCount1 = nonEmpty[0].length / 2;
    let nodeCount1 = nonEmpty[0].pointCount;
    let buffer = new Uint32Array(nonEmpty[0].array);

    GraphBuffer.resize(accum, edgeCount1 * leftStretch * 2);
    accum.pointCount = leftStretch * nodeCount1;

    arrayTimes(leftStretch, buffer, buffer);
    for (var i = 0, pos = 0; i < leftStretch; i++, pos += 2 * edgeCount1) {
        accum.array.set(buffer, pos);
        incArray(buffer, 1);
    }

    edgeCount1 = accum.length / 2;
    nodeCount1 = accum.pointCount;
    buffer = new Uint32Array(accum.array);

    GraphBuffer.resize(accum, edgeCount1 * midStretch * 2);
    accum.pointCount = midStretch * nodeCount1;

    for (var i = 0, pos = 0; i < midStretch; i++, pos += 2 * edgeCount1) {
        accum.array.set(buffer, pos);
        incArray(buffer, nodeCount1);
    }

    makeFaces2([accum, nonEmpty[1]], accum);

    if (rightStretch !== 1) {
        const rightPad = {
            array: new Uint32Array(0),
            pointCount: rightStretch,
            length: 0
        };
        cartesianGraphProd([accum, rightPad], accum)
    }

    GraphBuffer.resize(target, accum.length);
    target.array.set(accum.array);
    target.pointCount = accum.pointCount;
};
