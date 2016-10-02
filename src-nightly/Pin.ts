import * as _ from 'lodash';
import { isExisty, asArray, makeID } from './utils';

import { InstanceGL, interleave } from './glUtils';
import { Buffer } from './array/Buffer';
import { Panel } from './Panel';
import { registry } from './registry';
import { Style } from './Style';
import { constant } from './generators';

/*
 * Связка между графар-переменными и панелью.
 */
export class Pin {
    constructor(selection: { axes: string[], color?: [string, string, string] }, panel: Panel) {
        this.axes = [ selection.axes[1], selection.axes[2], selection.axes[0] ];
        // No need for color?
        this.glinstance = new InstanceGL(panel, Style.randColor());
        // set sprite size: should be configurable
        this.glinstance.object.children[0].material.size = 2;

        if (!selection.color) {
            this.colors = _([0 / 255, 140 / 255, 240 / 255])
                .map(cmp => registry.extern(constant(makeID, cmp)))
                .flatten<string>()
                .value();
        }

        Pin.pins.push(this);
    }

    glinstance: InstanceGL;
    hidden = false;
    axes: string[] = [];
    colors: string[] = [];

    refresh() {
        const instance = this.glinstance;
        /** FIXME проблемы с порядком */
        const tab = registry.project(this.axes.concat(this.colors));
        const pos = tab.data.slice(0, this.axes.length);
        const col = tab.data.slice(this.axes.length);

        /**
         * FIXME
         * 1. нужно обновлять и при изменении топологии
         * 2. Возможно, данные уже провалидированы где-то еще
         */
        if (tab.data.every(col => col.isValid)) {
            return this;
        }

        const computedPos = pos.map(col => col.value());
        const normalizedComputed = this.axes.length === 2
            ? [ computedPos[0], null, computedPos[1] ]
            : computedPos;
        interleave(normalizedComputed, instance.position, 3);

        interleave(col.map(col => col.value()), instance.color);

        /** Как-нибудь можно попробовать шеллоу, если не цеплять одни edges и faces к разным GL-контекстам */
        Buffer.clone(instance.segments, tab.edges.value());
        Buffer.clone(instance.faces, tab.faces.value());

        Buffer.resize(instance.normals, tab.length.value() * 3);
        instance.object.children[2].geometry.computeVertexNormals();

        const hasEdges = tab.edges.value().length > 0;
        const hasFaces = tab.faces.value().length > 0;
        instance.object.children[0].visible = !hasEdges && !hasFaces;

        return this;
    }

    run() {
        this.refresh();
        window.requestAnimationFrame(() => this.run());
        return this;
    }

    hide(hide) {
        this.glinstance.object.visible = !hide;
        return this;
    }

    static pins: Pin[] = []
    static refresh() {
        Pin.pins.forEach(pin => pin.refresh());
        return this;
    }
}
