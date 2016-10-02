import { dot, norm } from './vectorUtils';
import { arraySum, arrayTimes } from './arrayUtils';
import { config as fullConfig } from './config';
import { ConstraintData } from './GrafarObject';
import * as _ from 'lodash';

const config = fullConfig.grafaryaz;

/*
 * Если передать функцию, делает строку из ее результата,
 *   иначе делает строку из параметра.
 * Костылик, чтобы в генераторы можно было передавать
 *   - функцию, возвращающую уникальное имя переменной (при создании)
 *   - Имя переменной (при обновлении)
 */
function extractUid(source: any): string {
    if (source instanceof Function) {
        return '' + source();
    }
    return '' + source;
}

/*
 * Заполнить l первых элементов массива arr нулями.
 * Если arr instanceof Array и arr.length < l, arr увеличится до размера l.
 * Если arr instanceof TypedArray, то arr заполнится до конца и функция будет работать медленно.
 * TODO: перетащить в arrayUtils
 */
function zeros(arr, l: number) {
    for (let i = 0; i < l; i++) {
        arr[i] = 0;
    }
    return arr;
};

/*
 * Заполнить l первых элементов массива arr случайными элементами на отрезке mean +- spread.
 * Если arr.length < l, то:
 *   - при arr instanceof Array: arr увеличится до размера l.
 *   - при arr instanceof TypedArray: arr заполнится до конца и функция будет работать медленно.
 */
function randomize(arr, l: number, mean: number, spread: number) {
    for (var i = 0; i < l; i++) {
        arr[i] = mean + spread / 2 * (Math.random() + Math.random() - 1);
    }
}

/*
 * Обернуть числа из массива set для графара.
 * @discrete -- использовать дискретную топологию (не соединять точки)
 *   @default true
 */
function set(nameGen: () => string, set: any[], discrete: boolean = true) {
    const name = extractUid(nameGen);
    return {
        what: name,
        using: [],
        discrete,
        maxlen: set.length,
        as: function(data, l, extras) {
            data[name].set(set);
            extras['continuous'] = true;
        }
    };
}

/*
 * Обернуть одно число для графара.
 */
function constant(nameGen: () => string, val: number): ConstraintData {
    const name = extractUid(nameGen);
    return {
        what: name,
        using: [],
        discrete: true,
        maxlen: 1,
        as: function(data, l, extras) {
            for (var i = 0; i < l ; i++) {
                data[name][i] = val;
            }
            extras['continuous'] = true;
        }
    };
}

/*
 * Дискретное графар-измерение из целых чисел на отрезке [start, end].
 */
function ints(nameGen: () => string, start: number, end: number): ConstraintData {
    const name = extractUid(nameGen);
    start = Math.ceil(Number(start));
    end = Math.floor(Number(end));
    const size = Math.abs(end + 1 - start);
    return {
        what: name,
        using: [],
        maxlen: size,
        discrete: true,
        as: function(data, l, extras) {
            for (var i = 0; i <= size; i++) {
                data[name][i] = start + i;
            }
            extras['continuous'] = false;
        }
    }
}

/*
 * Графар-измерение из size чисел с равным шагом между a и b:
 *   data[i] = a + i * (b - a) / size
 * TODO: разве правильно?
 * При closed = true шаг немного уменьшается, и последний элемент не упирается в b.
 * TODO: зачем?
 */
function seq(nameGen: () => string, a: number, b: number, size: number, closed: boolean = false, discrete: boolean = true): ConstraintData {
    const name = extractUid(nameGen);
    a = Number(a);
    b = Number(b);
    const closeFix = (closed? 0: 1);
    return {
        what: name,
        using: [],
        maxlen: size,
        discrete,
        as: (data, l, extras) => {
            var step = (b - a) / (l - closeFix);
            for (var i = 0; i < l; i++) {
                data[name][i] = a + i * step;
            }
            extras['continuous'] = !discrete;
        }
    };
}

/*
 * Отрезок [a, b] (топология отрезка).
 * Внутри использует seq.
 */
function range(nameGen: () => string, a: number, b: number, size: number): ConstraintData {
    return seq(nameGen, a, b, size, false, false);
}

/*
 * Логарифмическая последовательность чисел между a и b (больше чисел ближе к a).
 * TODO: убрать
 */
function logseq(nameGen: () => string, a: number, b: number, size: number): ConstraintData {
    const name = extractUid(nameGen);
    a = Number(a);
    b = Number(b);
    return {
        what: name,
        using: [],
        maxlen: size,
        discrete: false,
        as: (data, l, extras) => {
            var step = (b - a) / Math.log(l);
            for (var i = 1; i < l + 1; i++) {
                data[name][i] = a + Math.log(i) * step;
            }
            extras['continuous'] = true;
        }
    };
}

/*
 * Графар-измерение из size нулей функции f: R^dof -> R.
 * Использует метод Ньютона.
 */
function vsolve(nameGen: string[], f: (pt: number[]) => number, size: number, dof: number): ConstraintData;
function vsolve(nameGen: () => string, f: (pt: number[]) => number, size: number, dof: number): ConstraintData;
function vsolve(nameGen: any, f: (pt: number[]) => number, size: number, dof: number): ConstraintData {
    const names: string[] = nameGen instanceof Array
        ? _.flatten(<any[]>nameGen)
        : _.range(dof).map(() => extractUid(nameGen));
    console.log(names)
    var tol = config.tol,
        gradf = grad(f, dof),
        probeSize = 100,
        thisid = Math.random().toFixed(10),
        mean = [],
        spread = [],
        pt = [],
        realSize = 0,
        isEmpty = false,
        needsReshuffle = true;

    function estimator(flatData, l) {
        var i = 0, j = 0;

        realSize = 0;

        for (i = 0; i < probeSize; i++) {
            for (j = 0; j < dof; j++)
                pt[j] = -10 + 20 * Math.random();
            newton(pt, f, gradf, false, 100);
            if (f(pt) < tol) {
                for (var j = 0; j < dof; j++)
                    flatData[j][i] = pt[j];
                realSize++;
            }
        }

        for (j = 0; j < dof; j++) {
            var col = flatData[j],
                jmin = 1000,
                jmax = -1000,
                jsum = 0;
            for (i = 0; i < realSize; i++) {
                var val = col[i];
                jmin = Math.min(val, jmin);
                jmax = Math.max(val, jmax);
                jsum += val;
            }
            mean[j] = jsum / realSize;
            spread[j] = 2 * (jmax - jmin);
        }
    }

    function constructor(data, l: number, extras) {
        var flatData = names.map(name => data[name]);
        var i = 0;
        var j = 0;

        var s = performance.now();
        estimator(flatData, l);

        if (realSize === 0 && !isEmpty) {
            for (var j = 0; j < dof; j++) {
                zeros(flatData[j], l);
            }
            needsReshuffle = true;
            isEmpty = true;
            return;
        }

        if (true) {//realSize !== 0 && (needsReshuffle || invalids > 15)) {
            for (j = 0; j < dof; j++)
                randomize(flatData[j], l, mean[j], spread[j]);
            needsReshuffle = false;
            isEmpty = false;
        }

        if (!isEmpty) {
            for (i = 0; i < l; i++) {
                for (j = 0; j < dof; j++)
                    pt[j] = flatData[j][i];
                newton(pt, f, gradf, false, 30);
                for (var j = 0; j < dof; j++)
                    flatData[j][i] = pt[j];
            }
        }

        extras.continuous = false;
    };
    constructor['id'] = thisid;

    return {
        what: names,
        discrete: true,
        maxlen: size,
        using: [],
        as: constructor
    };
}

/*
 * Градиент функции fa: R^nargs -> R.
 * @result: функция (pt: number[nargs], val: number[nargs] === fa(pt), out: number[nargs])
 *   То есть нужно передать:
 *     - точку;
 *     - значение fa в этой точке (ура, сэкономили один вызов fa);
 *     - массив out, в который положить градиент.
 *   Использует nargs вызовов fa и никакой дополнительной памяти.
 *   После вызова значение pt может немного сползти на ошибку округления.
 */
function grad(fa: (pt: number[]) => number, nargs: number) {
    var diffStep = config.diffStep;
    return function(pt: number[], val: number, out: number[]) {
        for (var i = 0; i < nargs; i++) {
            // Оптимизационный трюк, чтобы не выделять память и не копировать массив.
            pt[i] += diffStep;
            out[i] = (fa(pt) - val) / diffStep;
            pt[i] -= diffStep;
        }
    };
}

// Эти контейнеры переиспользуются между вызовами newton для разных точек.
var nabla = [];
var offset = [];
/*
 * Попробовать найти нуль функции f с градиентом gradf методом Ньютона,
 *   начиная с точки pt. Положить решение в pt (да, параметр мутирует).
 * @param maxIter: наибольшее число итераций. При превышении функция возвращает 0.
 * @param acceptNeg: возвращать pt, если f(pt) <= 0: решать неравенство.
 */
function newton(pt: number[], f: (pt: number[]) => number, gradf: (pt0: number[], pt: number, targ: number[]) => void, acceptNeg: boolean, maxIter: number) {
    const tol = config.tol;
    const l = pt.length;
    let val = 0;
    let posterr = 0;

    for (let i = 0; i < maxIter; i++) {
        val = f(pt);
        gradf(pt, val, nabla);
        // Постериорная оценка ошибки (как далеко от решения мы находимся)
        posterr = -val / dot(nabla, nabla);

        for (let j = 0; j < l; j++) {
            offset[j] = posterr * nabla[j];
        }

        // Довольно близко
        if (norm(offset) < tol) {
            return pt;
        }

        // Подвинуть поближе
        for (let j = 0; j < l; j++) {
            pt[j] += offset[j];
        }
    }

    // Если не сошлись за maxIter итераций, вернуть 0.
    for (let j = 0; j < l; j++) {
        pt[j] = 0;
    }

    return pt;
}

export {
    constant,
    ints,
    set,
    seq,
    range,
    logseq,
    vsolve
}
