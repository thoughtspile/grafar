import * as _ from 'lodash';

import { Reactive } from './Reactive';
import { makeID } from './utils';

export class TopoRegistry {
    static free(edges, data) {
        const id = makeID();
        return new Reactive([{ id, edges: null, length: 0 }])
            .lift(([ edges, data ], self) => {
                self[0].edges = edges;
                self[0].length = data.length;
            })
            .bind([ edges, data ]);
    }

    static derive(bases) {
        return new Reactive([])
            .lift(src => _.union.apply(_, src).sort((a, b) => a.id.localeCompare(b.id)))
            .bind(bases);
    }
}
