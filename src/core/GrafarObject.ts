import * as _ from 'lodash';

import { isExisty, asArray } from '../utils';
import { Buffer } from '../array/Buffer';
import { Reactive } from './Reactive';
import { Graph, Slice } from './Graph';
import { TopoRegistry } from './topology/TopoRegistry';
import { Generator } from './Generator';

export interface ConstraintData {
    dimension?: number;
    what?: string | string[];
    using?: string | string[];
    as: (data, l: number, names: string[], extras?: { [key: string]: any }) => any;
    maxlen?: number;
    discrete?: boolean;
}

/**
 * Контейнер графара - здесь хранятся все объекты
 */
export class GrafarObject {
    datasets: { [name: string]: Graph } = {};
    projections: { [nameHash: string]: Slice } = {};

    constrain(constraint: ConstraintData) {
        const names = asArray(constraint.what);
        const using = asArray(constraint.using);
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
                out.forEach(buff => Buffer.resize(buff, lengthHack));
                /** Разложить массивы по именам */
                const namedData = _.extend(
                    _.zipObject(using, par.map(col => col.array)),
                    _.zipObject(names, out.map(col => col.array))
                );
                as(namedData, lengthHack, names, {});
            })
            .bind(sources.data);

        // TODO: do not create if updating and not changed
        const edges = isFree? TopoRegistry.freeEdges(discrete, length): sources.edges;
        const base = isFree? TopoRegistry.free(edges, length): sources.base;

        names.forEach((name, i) => {
            const updating = !!this.datasets[name];
            this.datasets[name] = this.datasets[name] || new Graph();
            const dataset = this.datasets[name];

            const oldBase = dataset.base.value();
            const newBase = base.value();
            // TODO: lazy new base materialization
            if (oldBase.length !== newBase.length || newBase.some((dim, i) => !dim.edges.eq(oldBase[i].edges))) {
                dataset.base.assign(base);
                dataset.edges.assign(edges);
            }
            // faces?
            dataset.data.lift(([ data, length ], target) => {
                    target.count = length;
                    target.array = data[i].array;
                })
                .bind([ data, length ]);
        });

        return this;
    }

    extern(constraint: ConstraintData) {
        const names = asArray(constraint.what);
        constraint.using = asArray(constraint.using);
        this.constrain(constraint);
        return names;
    }

    map(name: string, using: string | string[], fn: (...args: number[]) => number) {
        const names = asArray(using).map(Generator.acceptConst);
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

const compile = (ptMap: (...args: number[]) => number, using, what): ConstraintData => {
    const it = '__i__';
    const data = '__data__';
    const size = '__l__';
    const fn = '__fn__';

    const unbound = new Function(data, size, fn, `
        ${ Math.random() }; // random source chunk prevents inlining / deinlining when using multiple maps
        for (var ${it} = 0; ${it} < ${size}; ${it}++) {
            ${data}['${what}'][${it}] = ${fn}(
                ${using.map(name => `${data}['${name}'][${it}]`).join(',\n')}
            );
        }
    `);

    return { what, using, as: (data, l) => unbound(data, l, ptMap) };
}
