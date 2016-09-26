import { dot, norm } from './vectorUtils';
import { arraySum, arrayTimes } from './arrayUtils';
import { config as fullConfig } from './config';
import { Constraint } from './GrafarObject';

const config = fullConfig.grafaryaz;

function zeros(arr, l: number) {
    for (var i = 0; i < l; i++)
        arr[i] = 0;
    return arr;
};

function randomize(arr, l: number, mean: number, spread: number) {
    for (var i = 0; i < l; i++)
        arr[i] = mean + spread / 2 * (Math.random() + Math.random() - 1);
}

function pow (x: number, p: number) {
    var temp = Math.pow(x, p);
    if (!isNaN(temp))
        return temp;

    temp = -Math.pow(-x, p);
    if (Math.abs(Math.pow(temp, 1 / p) - x) < config.tol)
        return temp;

    return NaN;
}

function set(set: any[], name: string, discrete: boolean = true) {
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

function constant(valOuter: number, name: string): Constraint {
    const val = valOuter;
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

function ints(start: number, end: number, name: string): Constraint {
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

function seq(a: number, b: number, size: number, name: string, closed: boolean = false, discrete: boolean = true): Constraint {
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

function range(a: number, b: number, size: number, name: string): Constraint {
    return seq(a, b, size, name, false, false);
}

function logseq(a: number, b: number, size: number, name: string): Constraint {
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

function traceZeroSet(f: (pt: number[]) => number, size: number, names: string[]): Constraint {
    var dof = names.length,
        tol = config.tol,
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
        maxlen: size,
        using: [],
        as: constructor
    };
}

function grad(fa: (pt: number[]) => number, nargs: number) {
    var diffStep = config.diffStep;
    return function(pt: number[], val: number, out: number[]) {
        for (var i = 0; i < nargs; i++) {
            pt[i] += diffStep;
            out[i] = (fa(pt) - val) / diffStep;
            pt[i] -= diffStep;
        }
    };
}

var nabla = [];
var offset = [];
function newton(pt: number[], f: (pt: number[]) => number, gradf: (pt0: number[], pt: number, targ: number[]) => void, acceptNeg: boolean, maxIter: number) {
    var tol = config.tol,
        val = 0,
        i = 0,
        j = 0,
        posterr = 0,
        l = pt.length;

    for (i = 0; i < maxIter; i++) {
        val = f(pt);
        gradf(pt, val, nabla);
        posterr = -val / dot(nabla, nabla);
        for (j = 0; j < l; j++)
            offset[j] = posterr * nabla[j];
        if (norm(offset) < tol)
            return pt;
        for (j = 0; j < l; j++)
            pt[j] += offset[j];
    }

    for (j = 0; j < l; j++)
        pt[j] = 0; ////// WWWWWWWWWWWWWWTTTTTTTTTTTTTTFFFFFFFFFFF
    return pt;
}

export {
    constant,
    ints,
    set,
    seq,
    range,
    logseq,
    traceZeroSet,
    pow
}
