import { Set } from './Set';

function mkGen() {
    // seed prevents premature inlining
    const seed = Math.floor(Math.random() * 10000);
    return Function(['fn', 'raw', 'size'],
        `${seed}; for (var i = 0; i < size; i++) raw[i] = fn(i);`);
}

class Generator  {
    constructor(fn) {
        this.gen = mkGen();
        this.fn = fn;
    }

    into(set) {
        this.gen(this.fn, set.raw()[0], set.size());
        return set;
    }
    
    static into(fn, set) {
        mkGen()(fn, set.raw()[0], set.size());
        return set;
    }
}

// thread-unsafe
const gens = {
    int: (function() {
        let start = 0;
        const gen = new Generator(i => start + i);
        return {
            setup: function(obj) {
                start = obj.start;
                return this;
            },
            into: gen.into.bind(gen)
        };
    }())
};

function ints(startLoc, end, targ) {
    const start = Math.ceil(startLoc);
    const size = Math.abs(Math.floor(end) + 1 - start);
    targ = targ ? targ.size(size) : new Set(1, size);

    return gens.int.setup({ start }).into(targ);
}


export {
    ints,
    Generator
};
