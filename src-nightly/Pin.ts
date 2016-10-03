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
    constructor(selection: { axes: string[], color?: string[] }, panel: Panel) {
        this.axes = [ selection.axes[1], selection.axes[2], selection.axes[0] ];
        // No need for color?
        this.glinstance = new InstanceGL(panel, Style.randColor());
        // set sprite size: should be configurable

        this.colors = selection.color || _([0 / 255, 140 / 255, 240 / 255])
            .map(cmp => registry.extern(constant(makeID, cmp)))
            .flatten<string>()
            .value();

        Pin.pins.push(this);
    }

    glinstance: InstanceGL;
    hidden = false;
    axes: string[] = [];
    colors: string[] = [];

    refresh() {
        const instance = this.glinstance;
        /** FIXME проблемы с порядком */
        const dim = this.axes.filter(Boolean).length;
        const tab = registry.project(this.axes.concat(this.colors));
        const pos = tab.data.slice(0, dim);
        const col = tab.data.slice(dim);

        /**
         * FIXME
         * 1. нужно обновлять и при изменении топологии
         * 2. Возможно, данные уже провалидированы где-то еще
         */
        if (tab.data.every(col => col.isValid)) {
            return this;
        }

        const computedPos = pos.map(col => col.value());
        const normalizedComputed = dim === 2
            ? [ computedPos[0], null, computedPos[1] ]
            : computedPos;
        interleave(normalizedComputed, instance.position, 3);
        instance.position.count = tab.length.value();

        interleave(col.map(col => col.value()), instance.color, 3);
        instance.color.count = tab.length.value();

        /** Как-нибудь можно попробовать шеллоу, если не цеплять одни edges и faces к разным GL-контекстам */
        Buffer.clone(instance.segments, tab.edges.value());
        /** Three не определился: count -- количество элементов массива, или раз по itemSize */
        instance.segments.count = tab.edges.value().count * 2;
        instance.segments.needsUpdate = true;

        Buffer.clone(instance.faces, tab.faces.value());

        instance.faces.count = tab.faces.value().count * 3;
        instance.faces.needsUpdate = true;

        Buffer.resize(instance.normals, tab.length.value() * 3);
        instance.normals.needsUpdate = true;
        instance.normals.count = tab.length.value();
        instance.object.children[2].geometry.computeVertexNormals();

        const hasEdges = tab.edges.value().count > 0;
        const hasFaces = tab.faces.value().count > 0;
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
