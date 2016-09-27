import * as _ from 'lodash';
import { isExisty, asArray } from './utils';

import { InstanceGL, interleave, resizeBuffer } from './glUtils';
import { Panel } from './Panel';
import { registry } from './registry';
import { Style } from './Style';

export class Pin {
    constructor(selection: string[], panel: Panel) {
        this.glinstance = new InstanceGL(panel, this.col);
        Pin.pins.push(this);
    }

    glinstance: any; // InstancGL
    hidden = false;
    col = Style.randColor();

    refresh() {
        const instance = this.glinstance;
        const axes = instance.panel._axes;
        const tab = registry.project(axes, false);
        if (tab.every(col => col.data.isValid)) {
            return this;
        }

        const computed = tab.map(c => c.data.value());
        const normalizedComputed = tab.length === 2
            ? [ computed[1], null, computed[0] ]
            : computed;
        interleave(normalizedComputed, instance.position, 3);

        // debugger;
        // reactiveness!
        //interleave([tab[0].colors.value()], instance.color);

        interleave([tab[0].edges.value()], instance.segments);
        interleave([tab[0].faces.value()], instance.faces);

        resizeBuffer(instance.normals, tab[0].data.value().length * 3);
        instance.object.children[2].geometry.computeVertexNormals();

        const hasEdges = tab[0].edges.value().length > 0;
        const hasFaces = tab[0].faces.value().length > 0;
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
        const len = registry.project(this.glinstance.panel._axes)[0].data.value().length;
        resizeBuffer(buf, len * 3);

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
