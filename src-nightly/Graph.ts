import { resizeBuffer } from './glUtils';
import { Buffer, blockRepeat } from './arrayUtils';
import { GraphBuffer, emptyGraph, pathGraph, cartesianGraphProd, makeFaces } from './topology';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';

const baseOrder = [];
const baseComparator = (a, b) => baseOrder.indexOf(a) >= baseOrder.indexOf(b);

export class Graph {
    constructor() {}

    data = new Reactive(new Buffer());
    edges = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    faces = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    colors = new Reactive<Buffer>({ array: new Float32Array(0), length: 0 });
    base = new Reactive({ parent: this, struct: [] });

    static contextify(col, targetBase) {
        const temp = new Graph();
        temp.base = targetBase;
        temp.data.lift((par, out) => {
            const data = par[0];
            const colBase = par[1].struct;
            const targetBase = par[2].struct;
            const totalLength = targetBase
                    .map(item => item.data.value().length)
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
                        base.data.value().length,
                        res
                    );
                    len *= base.data.value().length;
                }
                blockSize *= base.data.value().length;
            });
        }).bind([col.data, col.base, temp.base]);
        return temp;
    }

    static unify(cols: Graph[]) {
        const targetBase = new Reactive({ parent: null, struct: [] })
            .lift(Graph.baseTranslate)
            .bind(cols.map(col => col.base));
        const baseEdges = new Reactive([])
            .lift((src, targ) => src[0].struct.map(base => base.edges.value()))
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

    static baseTranslate(src, self) {
        if (src.length === 0) {
            baseOrder.push(self.parent);
            self.struct = [self.parent];
        } else {
            nunion(src.map(b => b.struct), self.struct);
            self.struct.sort(baseComparator);
        }
    }
}
