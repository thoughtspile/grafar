import { resizeBuffer } from './glUtils';
import { Buffer, blockRepeat } from './arrayUtils';
import { GraphBuffer, emptyGraph, pathGraph, cartesianGraphProd, makeFaces } from './topology';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';
import * as _ from 'lodash';
import { makeID } from './utils';

export class Graph {
    constructor() {}

    data = new Reactive(new Buffer());
    edges = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    faces = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    colors = new Reactive<Buffer>({ array: new Float32Array(0), length: 0 });
    base = new Reactive([{ id: makeID(), edges: null, data: null }])
        .lift(([ edges, data ], self) => {
            self[0].edges = edges;
            self[0].data = data;
        })
        .bind([ this.edges, this.data ]);

    static contextify(col, targetBase) {
        const temp = new Graph();
        temp.base = targetBase;
        temp.data.lift((par, out) => {
            const data = par[0];
            const colBase = par[1];
            const targetBase = par[2];
            const totalLength = targetBase
                .map(item => item.data.length)
                .reduce((prod, len) => prod * len, 1);
            let blockSize = 1;
            let len = data.length;

            resizeBuffer(out, totalLength);
            const res = out.array;
            res.set(data.array);

            targetBase.forEach(base => {
                if (colBase.indexOf(base) === -1) {
                    blockRepeat(
                        res,
                        blockSize,
                        Math.floor(len / blockSize),
                        base.data.length,
                        res
                    );
                    len *= base.data.length;
                }
                blockSize *= base.data.length;
            });
        }).bind([col.data, col.base, temp.base]);
        return temp;
    }

    static unify(cols: Graph[]) {
        const targetBase = new Reactive([])
            .lift(src => _.union.apply(_, src).sort((a, b) => a.id.localeCompare(b.id)))
            .bind(cols.map(col => col.base));

        const baseEdges = new Reactive([])
            .lift(([ bases ], targ) => bases.map(base => base.edges))
            .bind([ targetBase ]);

        const targetEdges = new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift((arr, targ) => cartesianGraphProd(arr[0], targ))
            .bind([ baseEdges ]);
        const targetFaces = new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift((arr, targ) => makeFaces(arr[0], targ))
            .bind([ baseEdges ]);

        return cols.map(col => {
            const unified = Graph.contextify(col, targetBase);
            unified.edges = targetEdges;
            unified.faces = targetFaces;
            return unified;
        });
    }
}
