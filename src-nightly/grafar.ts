import * as _ from 'lodash';

import { UI } from './UI';

import { config } from './config';
import { registry } from './registry';
import { Style } from './Style';
import { Panel, panels } from './Panel';
import { GrafarObject } from './GrafarObject';
import * as generators from './generators';
import { makeID, asArray } from './utils';
import { Pin } from './Pin';

function setColor(threeObj, r, g, b) {
    threeObj.material.color.r = r / 255;
    threeObj.material.color.g = g / 255;
    threeObj.material.color.b = b / 255;
}

const normalizeNames = (names: string[] | string[][], forceDim?: number) => {
    const flatVars = _.flatten(names);
    return forceDim? _.range(forceDim).map(i => flatVars[i] || null): flatVars;
}

const grafar = {
    version: '4.01r',

    update() {
        panels.forEach(panel => panel.update());
        grafar.frameId++;
        window.requestAnimationFrame(grafar.update);
    },

    setup(changes, target) {
        target = target || config;
        Object.keys(changes).forEach(name => {
            if (!target.hasOwnProperty(name)) {
                return;
            }
            if (name === 'grafaryaz') {
                grafar.setup(changes[name], config.grafaryaz);
                return;
            }
            target[name] = changes[name];
        });
        return grafar;
    },

    config,
    panels,
    Style,
    Panel,
    generators,

    UI,
    ui(mockup, opts) {
        opts = opts || {};
        var container = opts.container || document;
        if (typeof(container) === 'string')
            container = document.getElementById(container);
        if (mockup instanceof Array)
            mockup = {init: mockup, type: 'group'};

        UI.push(mockup, container);

        return this;
    },

    map(using, fn) {
        const uid = makeID(Object.keys(registry.datasets));
        return registry.map(uid, using, fn);
    },

    constrain: registry.constrain.bind(registry),

    refresh: () => Pin.refresh(),

    pin(vars: string[][] | string[], panel) {
        // only works for single graph
        const axes = normalizeNames(vars, 3);
        panel.setAxes(axes);
        const pin = new Pin(axes, panel);

        pin.colorize({ using: '', as: Style.constantColor(0 / 255, 140 / 255, 240 / 255) });
        // duct-tape point visibility
        pin.glinstance.object.children[0].material.size = 2;
        setColor(pin.glinstance.object.children[0], 0, 128, 0);

        pin.refresh();
    },

    frameId: 0
}

Object.keys(generators).forEach(key => {
    grafar[key] = (...args) => {
        // only works for 1-d generators
        const uid = () => makeID(Object.keys(registry.datasets));
        const constraint = generators[key](uid, ...args);
        return registry.extern(constraint);
    };
});

// bootstrap
grafar.update();

// export
export = grafar;
window['grafar'] = grafar;
