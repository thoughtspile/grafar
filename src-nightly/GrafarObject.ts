import { isExisty, asArray } from './utils';
import { InstanceGL, interleave, resizeBuffer } from './glUtils';
import { Buffer } from './arrayUtils';
import { pool } from './arrayPool';
import { emptyGraph, pathGraph, cartesianGraphProd } from './topology';
import { Style } from './Style';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';
import { Graph, TopoRegistry } from './Graph';
import * as _ from 'lodash';

export interface Constraint {
    what: string | string[];
    using?: string | string[];
    as: (data, l: number, extras?: { [key: string]: any }) => any;
    maxlen?: number;
    discrete?: boolean;
}

export class GrafarObject{
    constructor(opts?: any) {}

    datasets: { [name: string]: Graph } = {};
    projections: { [nameHash: string]: Graph[] } = {};

    constrain(constraint: Constraint) {
        const names = asArray(constraint.what || []);
        const using = asArray(constraint.using || []);
        const as = constraint.as || (() => {});
        const maxlen = constraint.maxlen || 40;
        const discrete = constraint.discrete || false;
        const isFree = using.length === 0;

        const sources = this.project(using);

        const data = new Reactive({
                buffers: names.map(() => new Buffer()),
                length: 0
            })
            .lift((par, out) => {
                const data = {};
                using.forEach((srcName, i) => { data[srcName] = par[i].array; });
                out.length = par.length === 0? maxlen: par[0].length;
                for (var i = 0; i < names.length; i++) {
                    resizeBuffer(out.buffers[i], out.length);
                    data[names[i]] = out.buffers[i].array;
                }
                as(data, out.length, {});
            })
            .bind(sources.map(src => src.data));

        const edges = isFree
            ? new Reactive({ array: new Uint32Array(0), length: 0, pointCount: maxlen })
                .lift(discrete? emptyGraph: pathGraph)
            : sources[0].edges;

        const base = isFree
            ? TopoRegistry.free(edges, data)
            : sources[0].base;

        names.forEach((name, i) => {
            this.datasets[name] = this.datasets[name] || new Graph();
            const dataset = this.datasets[name];

            dataset.base = base;
            dataset.edges = edges;
            // faces?
            dataset.data.lift((src, target) => {
                    target.length = src[0].buffers[i].length;
                    target.array = src[0].buffers[i].array;
                })
                .bind([data]);
        });

        return this;
    }

    extern(constraint: Constraint) {
        const names = asArray(constraint.what || []);
        constraint.using = _.flatten(asArray(constraint.using || []));
        this.constrain(constraint);
        return names;
    }

    private compile(ptMap, vars, out) {
        var spreadInit = vars.map(name => 'var ' + name + ';').join('');
        var loopHeader = 'for (var __i__ = 0; __i__ < l; __i__++) {';
        var fetch = vars.map(name => name + ' = ' + 'data["' + name + '"][__i__];').join('');
        var apply = 'data["' + out + '"][__i__] = fn(' + vars.join(',') + ')';
        var loopFooter = '}';

        var body = spreadInit + loopHeader + fetch + apply + loopFooter;

        var unbound = new Function('data', 'l', 'fn', body);

        return {
            what: out,
            using: vars,
            as: function(data, l) { return unbound(data, l, ptMap); }
        };
    }

    map(name: string, using: string | string[], fn: (...args: number[]) => number) {
        const names = asArray(using || []);
        const constraint = this.compile(fn, names, name);
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
