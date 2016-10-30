import * as _ from 'lodash';

import { UI } from './UI';

import { config } from './config';
import { registry } from './core/registry';
import { Style } from './Style';
import { Panel, panels } from './rendering/Panel';
import { GrafarObject, ConstraintData } from './core/GrafarObject';
import * as generators from './generators';
import { Generator } from './Generator';
import * as timers from './timers';
import { makeID, asArray } from './utils';
import { Pin } from './rendering/Pin';

const normalizeNames = (names: string[] | string[][], forceDim?: number) => {
    const flatVars = _.flatten(names);
    return forceDim? _.range(forceDim).map(i => flatVars[i] || null): flatVars;
}

export const version = '4.01r';

export const update = () => {
    Pin.refresh();
    panels.forEach(panel => panel.update());
    window.requestAnimationFrame(update);
};

export const setup = (changes, target) => {
    target = target || config;
    Object.keys(changes).forEach(name => {
        if (!target.hasOwnProperty(name)) {
            return;
        }
        if (name === 'grafaryaz') {
            setup(changes[name], config.grafaryaz);
            return;
        }
        target[name] = changes[name];
    });
};

export {
    config,
    panels,
    Style,
    Panel,
    generators,

    // ugly legacy
    UI,
};

export const ui = (mockup, opts) => {
    opts = opts || {};
    var container = opts.container || document;
    if (typeof(container) === 'string')
        container = document.getElementById(container);
    if (mockup instanceof Array)
        mockup = {init: mockup, type: 'group'};

    UI.push(mockup, container);

    return this;
};

export const map = (using, fn) => {
    const uid = makeID(Object.keys(registry.datasets));
    return registry.map(uid, using, fn);
};

export const constrain = (constraint: ConstraintData) => registry.constrain(constraint);

export const refresh = () => Pin.refresh();

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
export const frame = timers.frame;

// bootstrap
update();
