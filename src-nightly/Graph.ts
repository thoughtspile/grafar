import * as _ from 'lodash';

import { resizeBuffer } from './glUtils';
import { Buffer, blockRepeat } from './arrayUtils';
import { GraphBuffer, emptyGraph, pathGraph, cartesianGraphProd, makeFaces } from './topology';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';
import { TopoRegistry } from './TopoRegistry';

export class Graph {
    constructor() {}

    data = new Reactive(new Buffer());
    edges = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    faces = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    colors = new Reactive(new Buffer());
    base = TopoRegistry.free(this.edges, this.data);

    private contextify(targetBase) {
        return new Reactive(new Buffer()).lift(([data, colBase, targetBase], out) => {
            const totalLength = targetBase
                .map(item => item.length)
                .reduce((prod, len) => prod * len, 1);
            let blockSize = 1;
            let len = data.length;

            resizeBuffer(out, totalLength);
            const res = out.array;
            res.set(data.array);

            targetBase.forEach(base => {
                const dimSize = base.length;
                if (colBase.indexOf(base) === -1) {
                    blockRepeat(res, blockSize, Math.floor(len / blockSize), dimSize, res);
                    len *= dimSize;
                }
                blockSize *= dimSize;
            });
        }).bind([ this.data, this.base, targetBase ]);
    }

    static unify(cols: Graph[]) {
        const targetBase = TopoRegistry.derive(cols.map(col => col.base));

        const baseEdges = new Reactive([])
            .lift(([ bases ], targ) => bases.map(base => base.edges))
            .bind([ targetBase ]);

        const targetEdges = new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift(([ dimEdges ], targ) => cartesianGraphProd(dimEdges, targ))
            .bind([ baseEdges ]);
        const targetFaces = new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift(([ dimEdges ], targ) => makeFaces(dimEdges, targ))
            .bind([ baseEdges ]);

        return cols.map(col => {
            const unified = new Graph();

            unified.data = col.contextify(targetBase);
            unified.base = targetBase;
            unified.edges = targetEdges;
            unified.faces = targetFaces;

            return unified;
        });
    }
}
