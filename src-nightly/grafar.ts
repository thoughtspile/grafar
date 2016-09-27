import { grafar } from './api';
import * as _ from 'lodash';

import { UI, ui } from './UI';

import { Registry } from './Registry';
import { Style } from './Style';
import { Panel } from './Panel';
import { GrafarObject } from './GrafarObject';
import * as generators from './generators';
import { makeID, asArray } from './utils';

grafar['Style'] = Style;
grafar['Panel'] = Panel;
grafar['UI'] = UI;
grafar['ui'] = ui;

const registry = new GrafarObject();

Object.keys(generators).forEach(key => {
    grafar[key] = (...args) => {
        // only works for 1-d generators
        const uid = () => makeID(Object.keys(registry.datasets));
        const constraint = generators[key](uid, ...args);
        return registry.extern(constraint);
    };
});

grafar['map'] = (using, fn) => {
    const uid = makeID(Object.keys(registry.datasets));
    return registry.map(uid, using, fn);
};

grafar['constrain'] = registry.constrain.bind(registry);
grafar['refresh'] = registry.refresh.bind(registry);

function setColor(threeObj, r, g, b) {
    threeObj.material.color.r = r / 255;
    threeObj.material.color.g = g / 255;
    threeObj.material.color.b = b / 255;
}

const normalizeNames = (names: string[] | string[][], forceDim?: number) => {
    const flatVars = _.flatten(names);
    return forceDim? _.range(forceDim).map(i => flatVars[i] || null): flatVars;
};

grafar['generators'] = generators;

grafar['pin'] = (vars: string[][] | string[], panel) => {
    // only works for single graph
    const axes = normalizeNames(vars, 3);
    panel.setAxes(axes);
    registry.pin(panel);

    registry.colorize({ using: '', as: Style.constantColor(0 / 255, 140 / 255, 240 / 255) });
    // duct-tape point visibility
    registry.glinstances[0].object.children[0].material.size = 2;
    setColor(registry.glinstances[0].object.children[0], 0, 128, 0);

    registry.refresh();
};

// bootstrap
grafar.update();

window['grafar'] = grafar;
