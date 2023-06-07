import union from 'lodash/union';

import { Reactive } from '../Reactive';
import { makeID } from '../../utils';
import { emptyGraph, pathGraph } from './free';
import { cartesianGraphProd } from './cartesianGraphProd';
import { makeFaces } from './face';
import { GraphBuffer } from './GraphBuffer';

export { GraphBuffer };

export interface DimDescriptor {
    id: string;
    edges: GraphBuffer;
    length: number;
}

export class TopoRegistry {
    static free(edges: Reactive<GraphBuffer>, length: Reactive<number>) {
        const id = makeID();
        return new Reactive<DimDescriptor[]>([{ id, edges: null, length: 0 }])
            .lift(([ edges, length ], self) => [{ id, edges, length}])
            .bind([ edges, length ]);
    }

    static derive(bases: Reactive<DimDescriptor[]>[]) {
        return new Reactive<DimDescriptor[]>([])
            .lift(src => union( src).sort((a:DimDescriptor, b:DimDescriptor) => a.id.localeCompare(b.id)))
            .bind(bases);
    }

    static freeEdges(discrete: boolean, length: Reactive<number>) {
        return new Reactive(new GraphBuffer(2))
            .lift(([ length ], edges) => {
                edges.pointCount = length;
                return discrete? emptyGraph(null, edges): pathGraph(null, edges);
            })
            .bind([ length ]);
    }

    static deriveEdges(baseEdges: Reactive<GraphBuffer[]>) {
        return new Reactive(new GraphBuffer(2))
            .lift(([ dimEdges ], targ) => cartesianGraphProd(dimEdges, targ))
            .bind([ baseEdges ]);
    }

    static deriveFaces(baseEdges: Reactive<GraphBuffer[]>) {
        return new Reactive(new GraphBuffer(3))
            .lift(([ dimEdges ], targ) => makeFaces(dimEdges, targ))
            .bind([ baseEdges ]);
    }
}
