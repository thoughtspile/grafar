import * as _ from 'lodash';

import { Reactive } from '../Reactive';
import { makeID } from '../utils';
import { GraphBuffer, emptyGraph, pathGraph, cartesianGraphProd, makeFaces } from './topology';

export { GraphBuffer };

export class TopoRegistry {
    static free(edges: Reactive<GraphBuffer>, length: Reactive<number>) {
        const id = makeID();
        return new Reactive([{ id, edges: null, length: 0 }])
            .lift(([ edges, length ], self) => {
                self[0].edges = edges;
                self[0].length = length;
            })
            .bind([ edges, length ]);
    }

    static derive(bases) {
        return new Reactive([])
            .lift(src => _.union.apply(_, src).sort((a, b) => a.id.localeCompare(b.id)))
            .bind(bases);
    }

    static freeEdges(discrete: boolean, length: Reactive<number>) {
        return new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift(([ length ], edges) => {
                edges.pointCount = length;
                return discrete? emptyGraph(null, edges): pathGraph(null, edges);
            })
            .bind([ length ]);
    }

    static deriveEdges(baseEdges: Reactive<GraphBuffer[]>) {
        return new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift(([ dimEdges ], targ) => cartesianGraphProd(dimEdges, targ))
            .bind([ baseEdges ]);
    }

    static deriveFaces(baseEdges: Reactive<GraphBuffer[]>) {
        return new Reactive({ array: new Uint32Array(0), length: 0, pointCount: 0 })
            .lift(([ dimEdges ], targ) => makeFaces(dimEdges, targ))
            .bind([ baseEdges ]);
    }
}
