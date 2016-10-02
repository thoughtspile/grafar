import * as _ from 'lodash';
import { isExisty, asArray } from './utils';

import { InstanceGL, interleave } from './glUtils';
import { Buffer } from './array/Buffer';
import { Panel } from './Panel';
import { registry } from './registry';
import { Style } from './Style';

/*
 * Связка между графар-переменными и панелью.
 */
export class Pin {
    constructor(selection: { axes: string[], color?: string[] }, panel: Panel) {
        this.selection = [ selection.axes[1], selection.axes[2], selection.axes[0] ];
        this.glinstance = new InstanceGL(panel, this.col);

        if (!selection.color) {
            this.colorize({ using: '', as: Style.constantColor(0 / 255, 140 / 255, 240 / 255) });
            // duct-tape point visibility
            this.glinstance.object.children[0].material.size = 2;
            setColor(this.glinstance.object.children[0], 0, 128, 0);
        }

        Pin.pins.push(this);
    }

    glinstance: InstanceGL;
    hidden = false;
    selection: string[];
    col = Style.randColor();

    refresh() {
        const instance = this.glinstance;
        const axes = this.selection;
        const tab = registry.project(axes);
        if (tab.data.every(col => col.isValid)) {
            return this;
        }

        const computed = tab.data.map(col => col.value());
        const normalizedComputed = tab.data.length === 2
            ? [ computed[0], null, computed[1] ]
            : computed;
        interleave(normalizedComputed, instance.position, 3);

        // debugger;
        // reactiveness!
        //interleave([tab[0].colors.value()], instance.color);

        interleave([tab.edges.value()], instance.segments);
        interleave([tab.faces.value()], instance.faces);

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

    colorize(args) {
        const using = asArray(args.using || []);
        const as = args.as || (() => {});

        const data = {};
        using.forEach(sourceName => {
            data[sourceName] = registry.datasets[sourceName].data.value().array;
        });
        const buf = this.glinstance.color;
        const len = registry.project(this.selection).length.value();
        Buffer.resize(buf, len * 3);

        as(buf.array, data, len);
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

function setColor(threeObj, r, g, b) {
    threeObj.material.color.r = r / 255;
    threeObj.material.color.g = g / 255;
    threeObj.material.color.b = b / 255;
}
