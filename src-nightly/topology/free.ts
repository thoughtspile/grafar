import { GraphBuffer } from './GraphBuffer';

/**
 * pathGraph кладет в target.array граф-путь на target.pointCount вершинах.
 *   Задаёт топологию свободного непрерывного измерения (отрезка).
 *   Например, граф-путь на 3 вершинах: [0,1, 1,2].
 *   target автоматически ресайзится до нужного размера, 2 * (target.pointCount - 1).
 *
 * srcDummy для совместимости с сигнатурой Reactive.lift(...).
 *   pathGraph задает топологию свободных измерений, так что в нормальной ситуации это пустой объект, но если нет, то ничего плохоо не случится.
 * target -- буфер для результата со (HACK) значимым pointCount.
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
 * srcDummy для совместимости с сигнатурой Reactive.lift(...).
 * target -- буфер для результата со (HACK) значимым pointCount.
 */
export function emptyGraph(srcDummy: any, target: GraphBuffer) {
    GraphBuffer.resize(target, 0);
}
