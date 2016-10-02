import { zeros } from './arrayUtils';
import { extractUid } from './utils';
import { config as fullConfig } from './config';
import { ConstraintData } from './GrafarObject';
import { newton } from './math/newton';
import { grad } from './math/grad';
import { randomize } from './math/randomize';
import * as _ from 'lodash';

const config = fullConfig.grafaryaz;

/**
 * Обернуть числа из массива set для графара.
 * @discrete -- использовать дискретную топологию (не соединять точки)
 *   @default true
 */
export function set(nameGen: () => string, set: any[], discrete: boolean = true) {
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

/**
 * Обернуть одно число для графара.
 */
export function constant(nameGen: () => string, val: number): ConstraintData {
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

/**
 * Дискретное графар-измерение из целых чисел на отрезке [start, end].
 */
export function ints(nameGen: () => string, start: number, end: number): ConstraintData {
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

/**
 * Графар-измерение из size чисел с равным шагом между a и b:
 *   data[i] = a + i * (b - a) / size
 * TODO: разве правильно?
 * При closed = true шаг немного уменьшается, и последний элемент не упирается в b.
 * TODO: зачем?
 */
export function seq(nameGen: () => string, a: number, b: number, size: number, closed: boolean = false, discrete: boolean = true): ConstraintData {
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

/**
 * Отрезок [a, b] (топология отрезка).
 * Внутри использует seq.
 */
export function range(nameGen: () => string, a: number, b: number, size: number): ConstraintData {
    return seq(nameGen, a, b, size, false, false);
}

/**
 * Логарифмическая последовательность чисел между a и b (больше чисел ближе к a).
 */
export function logseq(nameGen: () => string, a: number, b: number, size: number): ConstraintData {
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
export function vsolve(nameGen: string[], f: (pt: number[]) => number, size: number, dof: number): ConstraintData;
export function vsolve(nameGen: () => string, f: (pt: number[]) => number, size: number, dof: number): ConstraintData;
export function vsolve(nameGen: any, f: (pt: number[]) => number, size: number, dof: number): ConstraintData {
    const names: string[] = nameGen instanceof Array
        ? _.flatten(<any[]>nameGen)
        : _.range(dof).map(() => extractUid(nameGen));

    const tol = config.tol;
    const gradf = grad(f, dof);
    const probeSize = 100;
    const thisid = Math.random().toFixed(10);
    const mean = [];
    const spread = [];
    const pt = [];
    let realSize = 0;
    let isEmpty = false;
    let needsReshuffle = true;

    function estimator(flatData, l) {
        realSize = 0;

        for (let i = 0; i < probeSize; i++) {
            for (j = 0; j < dof; j++) {
                pt[j] = -10 + 20 * Math.random();
            }
            newton(pt, f, gradf, false, 100);
            if (f(pt) < tol) {
                for (var j = 0; j < dof; j++) {
                    flatData[j][i] = pt[j];
                }
                realSize++;
            }
        }

        for (let j = 0; j < dof; j++) {
            const col = flatData[j];
            let jmin = 1000;
            let jmax = -1000;
            let jsum = 0;

            for (let i = 0; i < realSize; i++) {
                const val = col[i];
                jmin = Math.min(val, jmin);
                jmax = Math.max(val, jmax);
                jsum += val;
            }

            mean[j] = jsum / realSize;
            spread[j] = 2 * (jmax - jmin);
        }
    }

    function constructor(data, l: number, extras) {
        const flatData = names.map(name => data[name]);

        var s = performance.now();
        estimator(flatData, l);

        if (realSize === 0 && !isEmpty) {
            for (let j = 0; j < dof; j++) {
                zeros(flatData[j], l);
            }
            needsReshuffle = true;
            isEmpty = true;
            return;
        }

        if (true) {//realSize !== 0 && (needsReshuffle || invalids > 15)) {
            for (let j = 0; j < dof; j++) {
                randomize(flatData[j], l, mean[j], spread[j]);
            }
            needsReshuffle = false;
            isEmpty = false;
        }

        if (!isEmpty) {
            for (let i = 0; i < l; i++) {
                for (let j = 0; j < dof; j++) {
                    pt[j] = flatData[j][i];
                }
                newton(pt, f, gradf, false, 30);
                for (let j = 0; j < dof; j++) {
                    flatData[j][i] = pt[j];
                }
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
