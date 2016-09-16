import { resizeBuffer } from './glUtils';
import { Buffer, blockRepeat } from './arrayUtils';
import { emptyGraph, pathGraph, cartesianGraphProd, makeFaces } from './topology';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';

var baseOrder = [];
var baseComparator = (a, b) => baseOrder.indexOf(a) >= baseOrder.indexOf(b);

export class Graph {
    constructor() {
        this.data = new Reactive(new Buffer());
        this.edges = new Reactive({
            array: new Uint32Array(0),
            length: 0
        });
        this.faces = new Reactive({
            array: new Uint32Array(0),
            length: 0
        });
        this.colors = new Reactive({
            array: new Float32Array(0),
            length: 0
        });
        this.base = new Reactive({parent: this, struct: []});
    }

    static contextify(col, targetBase) {
        var temp = new Graph();
        temp.base = targetBase;
        temp.data.lift((par, out) => {
            var data = par[0],
                colBase = par[1].struct,
                targetBase = par[2].struct,
                totalLength = targetBase
                    .map(item => item.data.value().length)
                    .reduce((prod, len) => prod * len, 1),
                blockSize = 1,
                len = data.length;
            resizeBuffer(out, totalLength);
            var res = out.array;
            res.set(data.array);
            for (var i = 0; i < targetBase.length; i++) {
                if (colBase.indexOf(targetBase[i]) === -1) {
                    blockRepeat(
                        res,
                        blockSize,
                        Math.floor(len / blockSize),
                        targetBase[i].data.value().length,
                        res
                    );
                    len *= targetBase[i].data.value().length;
                }
                blockSize *= targetBase[i].data.value().length;
            }
        }).bind([col.data, col.base, temp.base]);
        return temp;
    }

    static unify(cols) {
        var targetBase = new Reactive({
                parent: null,
                struct: []
            })
            .lift(Graph.baseTranslate)
            .bind(cols.map(col => col.base));
        var baseEdges = new Reactive([])
            .lift((src, targ) => src[0].struct.map(base => base.edges.value()))
            .bind([targetBase]);
        var targetEdges = new Reactive({
                array: new Uint32Array(0),
                length: 0
            })
            .lift((arr, targ) => cartesianGraphProd(arr[0], targ))
            .bind([baseEdges]);
        var targetFaces = new Reactive({
                array: new Uint32Array(0),
                length: 0
            })
            .lift((arr, targ) => makeFaces(arr[0], targ))
            .bind([baseEdges]);
        return cols.map(col => {
            var unified = Graph.contextify(col, targetBase);
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
