import { flatten } from 'lodash';

import { InstanceGL, interleave } from './glUtils';
import { Reactive } from '../core/Reactive';
import { Buffer } from '../array/Buffer';
import { Panel } from './Panel';
import { registry } from '../core/registry';
import { constant } from '../generators';

const defColor = () => (
  flatten([0 / 255, 140 / 255, 240 / 255].map(cmp => constant(cmp).select()))
);

/*
 * Связка между графар-переменными и панелью.
 */
export class Pin {
    constructor(selection: { axes: string[], color?: string[] }, panel: Panel) {
        this.axes = [ selection.axes[1], selection.axes[2], selection.axes[0] ];
        this.glinstance = new InstanceGL(panel);
        this.colors = selection.color || defColor();
        Pin.pins.push(this);

        this.bind();
    }

    glinstance: InstanceGL;
    hidden = false;
    axes: string[] = [];
    colors: string[] = [];

    bind() {
        const instance = this.glinstance;
        /** FIXME проблемы с порядком */
        const dim = this.axes.filter(Boolean).length;
        const tab = registry.project(this.axes.concat(this.colors));
        const pos = tab.data.slice(0, dim);
        const col = tab.data.slice(dim);

        this.reactives = {
          color: new Reactive(instance.color)
            .bind(col)
            .lift((cols, targ) => {
              interleave(cols, targ, 3);
              // FIXME this is some hack
              targ.count = tab.length.value();
            }),
          position: new Reactive(instance.position)
            .bind(pos)
            .lift((pos, targ) => {
              const orderedPos = dim === 2 ? [ pos[0], null, pos[1] ] : pos;
              interleave(orderedPos, targ, 3);
              targ.count = tab.length.value();
            }),
          edges: new Reactive(instance.segments)
            .bind([tab.edges])
            .lift(([edges], targ) => {
              // Как-нибудь можно попробовать шеллоу, если не цеплять
              // одни edges и faces к разным GL-контекстам
              Buffer.clone(targ, edges);
              // Three не определился: count -- количество элементов массива,
              // или раз по itemSize
              targ.count = edges.count * 2;
              targ.needsUpdate = true;
            }),
          faces: new Reactive(instance.faces)
            .bind([tab.faces])
            .lift(([faces], targ) => {
              Buffer.clone(targ, faces);
              targ.count = faces.count * 3;
              targ.needsUpdate = true;
            }),
        }

        return this;
    }

    refresh() {
      const instance = this.glinstance;
      /** FIXME проблемы с порядком */
      const dim = this.axes.filter(Boolean).length;
      const tab = registry.project(this.axes.concat(this.colors));
      const pos = tab.data.slice(0, dim);
      const col = tab.data.slice(dim);
      const len = tab.length.value();

      this.reactives.color.validate();
      this.reactives.position.validate();
      this.reactives.edges.validate();
      this.reactives.faces.validate();

      const hasEdges = tab.edges.value().count > 0;
      const hasFaces = tab.faces.value().count > 0;

      // update when anything updates, but only if faces present
      if (hasFaces) {
          Buffer.resize(instance.normals, len * 3);
          instance.normals.needsUpdate = true;
          instance.normals.count = len;
          ((instance.object.children[2] as any).geometry as THREE.Geometry).computeVertexNormals();
      }

      // update when topology updates
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

    // TODO: remove static updates, use self-pulling reactives
    static pins: Pin[] = []
    static refresh() {
        Pin.pins.forEach(pin => pin.refresh());
        return this;
    }

    reactives: {
      color: Reactive<THREE.BufferAttribute>;
      position: Reactive<THREE.BufferAttribute>;
      edges: Reactive<THREE.BufferAttribute>;
      faces: Reactive<THREE.BufferAttribute>;
    };
}
