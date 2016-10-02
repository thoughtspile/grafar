import * as _ from 'lodash';
import { isExisty, asArray } from './utils';

import { InstanceGL, interleave, resizeBuffer } from './glUtils';
import { Panel } from './Panel';
import { registry } from './registry';
import { Style } from './Style';

/*
 * Связка между графар-переменными и панелью.
 */
export class Pin {
    constructor(selection: string[], panel: Panel) {
        this.selection = [ selection[1], selection[2], selection[0] ];
        this.glinstance = new InstanceGL(panel, this.col);
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

        resizeBuffer(instance.normals, tab.data[0].value().length * 3);
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
        const len = registry.project(this.selection).data[0].value().length;
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
