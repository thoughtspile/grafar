import * as _ from 'lodash';

import { config } from './config';
import { registry } from './core/registry';
import { Panel, panels } from './rendering/Panel';
import { GrafarObject, ConstraintData } from './core/GrafarObject';
import * as generators from './generators';
import { Generator } from './core/Generator';
import * as timers from './timers';
import { makeID } from './utils';
import { Pin } from './rendering/Pin';

const normalizeNames = (names: string[] | string[][], forceDim?: number) => {
    const flatVars = _.flatten(names);
    return forceDim? _.range(forceDim).map(i => flatVars[i] || null): flatVars;
}

export const version = '4.5.18';

export const update = () => {
    Pin.refresh();
    panels.forEach(panel => panel.update());
    window.requestAnimationFrame(update);
};

export const setup = (changes) => {
    _.merge(config, changes);
};

export { Panel };

export const panel = (container: any, opts?: any) => new Panel(container, opts);

export const map = (using, fn) => {
    const uid = makeID();
    return registry.map(uid, using, fn);
};

export const constrain = (constraint: ConstraintData) => registry.constrain(constraint);

export const refresh = () => {
  console.log('grafar: explicit grafar.refresh() is deprecated.')
  Pin.refresh();
};

// pin(vars: { axes: string[][] | string[]; color: string[][] | string[]}, panel: Panel)
// pin(vars: string[][] | string[], panel)
export const pin = (vars: any, panel) => {
    const props = {
        axes: normalizeNames(vars.axes || vars, 3),
        color: vars.color? normalizeNames(vars.color, 3): null
    };
    const pin = new Pin(props, panel);
    pin.refresh();
    return pin;
};

// explicit generator enumeration to preserve typings
export const set = generators.set;
export const constant = generators.constant;
export const ints = generators.ints;
export const seq = generators.seq;
export const range = generators.range;
export const logseq = generators.logseq;
export const vsolve = generators.vsolve;

export const ms = timers.ms;

// run update loop
update();
