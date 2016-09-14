import { Set } from './Set';
import { Generator, ints } from './generators';
import { Map, map, each } from './transforms';
import { zip, cart } from './combine';
import { bind, Tick, volatile } from './bind-mixin';
import mus from 'microseconds';

const grafar = Object.freeze({
    version: '3.0.0',

    ints: ints,

    set: (arr) => {
        const clone = arr.slice();
        const size = clone.length;
        return bind(x => x, new Generator(i => clone[i]).into(new Set(1, size)));
    },

    range: (start, end, size) => {
        const step = (end - start) / (size - 1);
        return bind(x => x, new Generator(i => start + step * i).into(new Set(1, size)));
    },

    point: (data) => {
        let wrapper = new Set(1, 1);
        wrapper.raw()[0][0] = data;

        return bind(x => x, wrapper);
    },

    map: (source, fn) => {
        const compiledMap = (new Map(fn)).arg(source()).cache(new Set(1));
        return bind(() => compiledMap.exec(), source);
    },

    cart: (comps) => {
        const dim = comps.length;
        return bind(cart, comps, new Set(dim));
    },

    zip: zip
});

if (typeof window !== 'undefined') {
    window.grafar = grafar;
}

module.exports = grafar;
