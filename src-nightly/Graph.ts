import * as _ from 'lodash';

import { resizeBuffer } from './glUtils';
import { Buffer, blockRepeat } from './array/ArrayUtils';
import { Reactive } from './Reactive';
import { GraphBuffer, TopoRegistry } from './topology/TopoRegistry';

export interface Slice {
    data: Reactive<Buffer>[];
    edges: Reactive<GraphBuffer>;
    faces: Reactive<GraphBuffer>;
    base: Reactive<any>;
    length: Reactive<number>;
}

export class Graph {
    constructor() {}

    /** с геттером, потому что ссылка сохранилась в base */
    private _data = new Reactive(new Buffer());
    get data() { return this._data };

    private _edges = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    get edges() { return this._edges };

    private _faces = new Reactive<GraphBuffer>({ array: new Uint32Array(0), length: 0, pointCount: 0 });
    get faces() { return this._faces };

    private _base = TopoRegistry.free(this.edges, new Reactive(0).lift(data => data.length).bind([ this.data ]));
    get base() { return this._base };

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

    static unify(cols: Graph[]): Slice {
        const targetBase = TopoRegistry.derive(cols.map(col => col.base));

        const baseEdges = new Reactive<GraphBuffer[]>([])
            .lift(([ bases ], targ) => bases.map(base => base.edges))
            .bind([ targetBase ]);

        return {
            data: cols.map(col => col.contextify(targetBase)),
            base: targetBase,
            edges: TopoRegistry.deriveEdges(baseEdges),
            faces: TopoRegistry.deriveFaces(baseEdges),
            length: new Reactive(0)
                .lift(([ dims ]) => dims.reduce((prod, dim) => prod * dim.length, 1))
                .bind([ targetBase ])
        };
    }
}
