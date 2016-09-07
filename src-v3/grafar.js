import Set from './buffer-nd';
import { Generator, ints } from './generators';
import { Map, map, each } from './transforms';
import { zip, cart } from './combine';
import { bind, Tick, volatile } from './bind-mixin';
import mus from 'microseconds';

const grafar = {
    version: '3.0.0',

    ints: ints,

    set: (arr) => {
        const immutable = arr.slice();
        const size = arr.length;
        return new Generator(i => immutable[i]).into(new Set(1, size));
    },

    range: (start, end, size) => {
        const step = (end - start) / (size - 1);
        return new Generator(i => start + step * i).into(new Set(1, size));
    },

    map: (sources, fn) => {
        throw new Error('map not ready')
    },

    cart: (comps) => {
        const dim = comps.length;
        return bind(cart, comps, new Set(dim)); // autocache
    },

    Set: Set
}

if (typeof window !== 'undefined') {
    window.grafar = grafar;
}

module.exports = grafar;
