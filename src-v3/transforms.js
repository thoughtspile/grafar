import _ from 'lodash';

import Set from './buffer-nd';


// *** Helpers ***

function compileMap(fns) {
    const dimOut = fns.length;
    const compiled = fns.map(fn => wrapFn(fn, nListMap));

    return function compiledMap(src, targ) {
        for (let i = 0; i < dimOut; i++) {
            compiled[i](src, targ[i]);
        }
    };
}

function compileEach(fn) {}

function wrapFn(fn, compiler) {
    const nargfn = nListMap(fn.length);
    return function wrappedFn(src, target) { return nargfn(fn, src, target); };
};

function repWithI(count, pattern, join = ',') {
    return _.range(0, count)
        .map(i => pattern(i))
        .join(join);
}

function nListMap(nargs) {
    return new Function(['fn', 'src', 'target'],
        'var len = (src[0] || target).length;\n' +
        'for (var i = 0; i < len; i++)\n' +
        '  target[i] = fn(' + repWithI(nargs, i => `src[${i}][i]`, ',') + ');');
};

function nCall(nargs) {
    return new Function(['fn', 'src'],
        'var len = src[0].length;\n' +
        'for (var i = 0; i < len; i++)\n' +
        '  fn(' + repWithI(nargs, i => `src[${i}][i]`, ',') + ');');
}


// *** Exports ***

class Map {
    constructor(fn) {
        if (!Array.isArray(fn)) {
            fn = [fn];
        }

        this._dimOut = fn.length;
        this._compiled = compileMap(fn);
        this._cache = null;
        this._arg = null;
    }

    cache(cacheObj) {
        this._cache = cacheObj;
        return this;
    }

    arg(argObj) {
        this._arg = argObj;
        return this;
    }

    exec() {
        if (!this._cache) {
            this.cache(new Set(this._dimOut, this._arg.size()));
        }
        this._cache.size(this._arg.size());

        this._compiled(this._arg.raw(), this._cache.raw());

        return this._cache;
    }

    free() {
        return this.exec.bind(this);
    }
}

function map(src, fn, targ) {
    return new Map(fn).arg(src).cache(targ).exec();
}

function each(src, fn) {
    const compiled = nCall(src.getDims());
    compiled(fn, src.raw());
}


export {
    Map,
    map,
    each
};
