import { zeros } from './array/ArrayUtils';
import { isExisty, extractUid, makeID } from './utils';
import { config as fullConfig } from './config';
import { GrafarObject, ConstraintData } from './GrafarObject';
import { newton } from './math/newton';
import { grad } from './math/grad';
import { randomize } from './math/randomize';
import * as _ from 'lodash';
import { registry } from './registry';

const config = fullConfig.grafaryaz;

export class Generator {
    constructor(private anonymousConstraint: ConstraintData) {
    }

    select() {
        const names = _.range(this.getDimension())
            .map(() => makeID());
        this.anonymousConstraint.what = names;
        return registry.extern(this.anonymousConstraint);
    }

    into(names: string[]) {
        /** TODO normalize names */
        const expectDim = this.getDimension();
        if (names.length !== expectDim) {
            throw new Error(`Cannot apply generator: expected ${ expectDim }-dimensional selection, got ${ names.length }`);
        }

        this.anonymousConstraint.what = names;
        return registry.constrain(this.anonymousConstraint);
    }

    private getDimension() {
        const constraintDim = this.anonymousConstraint.dimension;
        return isExisty(constraintDim)? constraintDim: 1;
    }
}

/**
 * Обернуть числа из массива set для графара.
 * @discrete -- использовать дискретную топологию (не соединять точки)
 *   @default true
 */
export function set(set: any[], discrete: boolean = true) {
    return new Generator({
        using: [],
        discrete,
        maxlen: set.length,
        as: function(data, l, [name], extras) {
            data[name].set(set);
        }
    });
}

/**
 * Обернуть одно число для графара.
 */
export function constant(val: number) {
    return new Generator({
        using: [],
        discrete: true,
        maxlen: 1,
        as: function(data, l, [name], extras) {
            for (var i = 0; i < l ; i++) {
                data[name][i] = val;
            }
        }
    });
}

/**
 * Дискретное графар-измерение из целых чисел в отрезке [start, end].
 */
export function ints(start: number, end: number) {
    start = Math.ceil(Number(start));
    end = Math.floor(Number(end));
    const size = Math.abs(end + 1 - start);
    return new Generator({
        using: [],
        maxlen: size,
        discrete: true,
        as: function(data, l, [name], extras) {
            for (var i = 0; i <= size; i++) {
                data[name][i] = start + i;
            }
        }
    });
}

/**
 * Графар-измерение из size чисел с равным шагом между a и b:
 *   data[i] = a + i * (b - a) / size
 * TODO: разве правильно?
 * При closed = true шаг немного уменьшается, и последний элемент не упирается в b.
 * TODO: зачем?
 */
export function seq(a: number, b: number, size: number, closed: boolean = false, discrete: boolean = true) {
    a = Number(a);
    b = Number(b);
    const closeFix = (closed? 0: 1);
    return new Generator({
        using: [],
        maxlen: size,
        discrete,
        as: (data, l, [name], extras) => {
            var step = (b - a) / (l - closeFix);
            for (var i = 0; i < l; i++) {
                data[name][i] = a + i * step;
            }
        }
    });
}

/**
 * Отрезок [a, b] (топология отрезка).
 * Внутри использует seq.
 */
export function range(a: number, b: number, size: number) {
    return seq(a, b, size, false, false);
}

/**
 * Логарифмическая последовательность чисел между a и b (больше чисел ближе к a).
 */
export function logseq(a: number, b: number, size: number) {
    a = Number(a);
    b = Number(b);
    return new Generator({
        using: [],
        maxlen: size,
        discrete: false,
        as: (data, l, [name], extras) => {
            const step = (b - a) / Math.log(l);
            for (var i = 1; i < l + 1; i++) {
                data[name][i] = a + Math.log(i) * step;
            }
        }
    });
}

/*
 * Графар-измерение из size нулей функции f: R^dof -> R.
 * Использует метод Ньютона.
 */
export function vsolve(f: (pt: number[]) => number, size: number, dof: number) {
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

    function constructor(data, l: number, names, extras) {
        const flatData = names.map(name => data[name]);

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
                newton(pt, f, gradf, true, 30);
                for (let j = 0; j < dof; j++) {
                    flatData[j][i] = pt[j];
                }
            }
        }
    };

    return new Generator({
        dimension: dof,
        discrete: true,
        maxlen: size,
        using: [],
        as: constructor
    });
}
