import { isExisty, asArray } from './utils';
import { InstanceGL, interleave, resizeBuffer } from './glUtils';
import { Buffer } from './arrayUtils';
import { pool } from './arrayPool';
import { Style } from './Style';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';
import { Graph, Slice } from './Graph';
import { TopoRegistry } from './TopoRegistry';
import * as _ from 'lodash';

export interface ConstraintData {
    what: string | string[];
    using?: string | string[];
    as: (data, l: number, extras?: { [key: string]: any }) => any;
    maxlen?: number;
    discrete?: boolean;
}

export class GrafarObject{
    constructor(opts?: any) {}

    datasets: { [name: string]: Graph } = {};
    projections: { [nameHash: string]: Slice } = {};

    constrain(constraint: ConstraintData) {
        const names = asArray(constraint.what || []);
        const using = asArray(constraint.using || []);
        const as = constraint.as || (() => {});
        const maxlen = constraint.maxlen || 40;
        const discrete = constraint.discrete || false;
        const isFree = using.length === 0;

        const sources = this.project(using);

        const length = isFree? new Reactive(maxlen): sources.length;
        const data = new Reactive(names.map(() => new Buffer()))
            .lift((par, out) => {
                /** HACK: при обновлении length данные не пересчитаются */
                const lengthHack = length.value();
                out.forEach(buff => resizeBuffer(buff, lengthHack));
                /** Разложить массивы по именам */
                const namedData = _.extend(
                    _.zipObject(using, par.map(col => col.array)),
                    _.zipObject(names, out.map(col => col.array))
                );
                as(namedData, lengthHack, {});
            })
            .bind(sources.data);

        const edges = isFree? TopoRegistry.freeEdges(discrete, length): sources.edges;
        const base = isFree? TopoRegistry.free(edges, length): sources.base;

        names.forEach((name, i) => {
            this.datasets[name] = this.datasets[name] || new Graph();
            const dataset = this.datasets[name];

            dataset.base.assign(base);
            dataset.edges.assign(edges);
            // faces?
            dataset.data.lift(([ data, length ], target) => {
                    target.length = length;
                    target.array = data[i].array;
                })
                .bind([ data, length ]);
        });

        return this;
    }

    extern(constraint: ConstraintData) {
        const names = asArray(constraint.what || []);
        constraint.using = _.flatten(asArray(constraint.using || []));
        this.constrain(constraint);
        return names;
    }

    map(name: string, using: string | string[], fn: (...args: number[]) => number) {
        const names = asArray(using || []);
        const constraint = compile(fn, names, name);
        return this.extern(constraint);
    }

    project(rawNames: string | string[] = []) {
        const names = asArray(rawNames);
        const namesHash = names.slice().sort().toString();
        if (!this.projections.hasOwnProperty(namesHash)) {
            const temp = names.map(name => {
                if (!this.datasets.hasOwnProperty(name)) {
                    throw new Error(`cannot select undefined ${ name }`);
                }
                return this.datasets[name];
            });
            this.projections[namesHash] = Graph.unify(temp);
        }
        return this.projections[namesHash];
    }
}

const compile = (ptMap: (...args: number[]) => number, vars, out): ConstraintData => {
    const unbound = new Function('data', 'l', 'fn', `
        ${ vars.map(name => `var ${ name };`).join('\n') }
        for (var __i__ = 0; __i__ < l; __i__++) {
            ${ vars.map(name => `${ name } = data["${ name }"][__i__];`).join('') }
            data["${ out }"][__i__] = fn(${ vars.join(',') })
        }
    `);

    return {
        what: out,
        using: vars,
        as: (data, l) => unbound(data, l, ptMap)
    };
}
