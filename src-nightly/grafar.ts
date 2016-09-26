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
grafar['Object'] = GrafarObject;
grafar['UI'] = UI;
grafar['ui'] = ui;

const registry = new GrafarObject();

Object.keys(generators).forEach(key => {
    grafar[key] = (...args) => {
        // only works for 1-d generators
        const uid = makeID(Object.keys(registry.datasets));
        const constraint = generators[key](uid, ...args);
        return registry.extern(constraint);
    };
});

grafar['map'] = (using, fn) => {
    const uid = makeID(Object.keys(registry.datasets));
    return registry.map(uid, using, fn);
}

grafar['pin'] = ([[x], [y], [z]]: string[][], panel) => {
    // only works for single graph
    panel.setAxes([x, y, z]);
    registry.pin(panel)
        .colorize({ using: '', as: Style.constantColor(0 / 255, 140 / 255, 240 / 255) })
        .refresh();
};

// bootstrap
grafar.update();

window['grafar'] = grafar;
