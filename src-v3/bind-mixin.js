import * as _ from 'lodash';

let _counter = 0;
let _actions = [];
let last = null;
export class Tick {
    static on(fn) {
        _actions.push(fn);
    }

    static off(fn) {
        const iFn = _actions.indexOf(fn);
        if (iFn === -1) return;
        _actions.splice(iFn, 1);
    }

    static execute() {
        _counter++;
        console.log(Date.now() - last);
        last = Date.now();
        _actions.forEach(fn => fn());
    }
}

const run = typeof window !== 'undefined'?
    fn => window.requestAnimationFrame(fn):
    fn => setTimeout(fn, 16);

(function alwaysTick() {
    Tick.execute();
    run(alwaysTick);
}());

function bindConst(arg) {
    let boundfn = () => arg;
    boundfn.updatedAt = () => -Infinity;
    boundfn._isBound = true;

    return boundfn;
}

export function volatile(arg) {
    let boundfn = () => arg;
    boundfn.updatedAt = () => _counter;
    boundfn._isBound = true;

    return boundfn;
}

export function bind(fn, ...args) {
    if (!fn) {
        if (args.length > 1) {
            throw new Error('Can\'t const-bind multiple args');
        }
        if (args[0]._isBound) {
            console.log('skip rebind');
            return args[0];
        }
        return bindConst(args[0]);
    }

    const liftedArgs = args.map(arg => bind(null, arg));
    let _updatedTick = -Infinity;
    let res;
    let forceUpdate = true;
    const parentUpdatedAt = () => _.max(liftedArgs.map(arg => arg.updatedAt()));
    const isValid = () => _updatedTick >= parentUpdatedAt();

    let boundfn = () => {
        if (forceUpdate || !isValid()) {
            res = fn.apply(null, liftedArgs.map(lift => lift()));
            _updatedTick = _counter;
            forceUpdate = false;
        }
        return res;
    };
    boundfn.updatedAt = () => Math.max(parentUpdatedAt(), _updatedTick);
    boundfn._isBound = true;

    return boundfn;
}
