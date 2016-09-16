import { isExisty, asArray } from './utils';
import { InstanceGL, interleave, resizeBuffer } from './glUtils';
import { Buffer } from './arrayUtils';
import { pool } from './arrayPool';
import { emptyGraph, pathGraph, cartesianGraphProd } from './topology';
import { Style } from './Style';
import { nunion } from './setUtils';
import { Reactive } from './Reactive';
import { Graph } from './Graph';

export class GrafarObject{
	constructor(opts) {
		this.datasets = {};
	    this.projections = {};

		this.glinstances = [];
	    //this.graphs = [];
		this.hidden = false;
	    this.col = Style.randColor();
	}

	pin(panel) {
		this.glinstances.push(new InstanceGL(panel, this.col));
	    // var graph = new Reactive().lift(function(proj){
	        // interleave(proj, instance.position);
	    // }).bind(this.project()) // won't work because of undefined unification
	    //this.graphs.push(graph);
		return this;
	}

	constrain(constraint) {
		const names = asArray(constraint.what || []);
		const using = asArray(constraint.using || []);
		const as = constraint.as || (() => {});
		const maxlen = constraint.maxlen || 40;
	    const discrete = constraint.discrete || false;

		//debugger;
	    const sources = this.project(using, true);
	    // I only do this shit because project forces product
	    // however, if it doesn't (force), memo would have to go into unify
	    // which sucks even worse
		names.filter(name => !this.datasets.hasOwnProperty(name))
			.forEach(name => { this.datasets[name] = new Graph(); });

	    const computation = new Graph();
	    computation.data = new Reactive({
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
	    if (sources.length === 0) {
	        computation.edges.data.pointCount = maxlen;
	        computation.edges.lift(discrete? emptyGraph: pathGraph);
	    } else {
	        computation.edges
	            .lift((src, targ) => {
	                // is clone stupid?
	                targ.pointCount = src[0].pointCount;
	                resizeBuffer(targ, src[0].length);
	                targ.array.set(src[0].array);
	            })
	            .bind(sources.map(src => src.edges));
	    }
	    computation.base
	        .lift(Graph.baseTranslate)
	        .bind(sources.map(src => src.base));

	    names.forEach((name, i) => {
	        const dataset = this.datasets[name];

	        dataset.base = computation.base;
	        dataset.edges = computation.edges;

            dataset.data
                .lift((src, target) => {
                    target.length = src[0].buffers[i].length;
                    target.array = src[0].buffers[i].array;
                })
                .bind([computation.data]);
	    });

		return this;
	}

	colorize(args) {
		const using = asArray(args.using || []);
		const as = args.as || (() => {});

		const data = {};
		using.forEach(sourceName => {
			data[sourceName] = this.datasets[sourceName].data.value().array;
		});
		const buf = this.glinstances[0].color;
		const len = this.project(this.glinstances[0].panel._axes)[0].data.value().length;
		resizeBuffer(buf, len * 3);
		// this should become as reactive as the Up-Goer 5
		as(buf.array, data, len);
		return this;
	}

	project(names, proxy) {
	    names = asArray(names || []);
	    const namesHash = names.slice().sort().toString();
	    if (!this.projections.hasOwnProperty(namesHash)) {
	        const temp = names.map(name => {
	            if (!this.datasets.hasOwnProperty(name)) {
	                if (proxy) {
	                    this.datasets[name] = new Graph();
	                } else {
	                    throw new Error('cannot select undefined');
					}
	            }
	            return this.datasets[name];
	        });
	        this.projections[namesHash] = Graph.unify(temp);
	    }
		return this.projections[namesHash];
	}

	refresh() {
		for (var i = 0; i < this.glinstances.length; i++) {
			const instance = this.glinstances[i];
			const tab = this.project(instance.panel._axes, false);
	        if (tab.every(col => col.data.isValid)) {
	            return this;
	        }

			interleave(tab.map(c => c.data.value()), instance.position, 3);

			// debugger;
			// reactiveness!
			//interleave([tab[0].colors.value()], instance.color);

			interleave([tab[0].edges.value()], instance.segments);
	        interleave([tab[0].faces.value()], instance.faces);

	        resizeBuffer(instance.normals, tab[0].data.value().length * 3);
	        instance.object.children[2].geometry.computeVertexNormals();

	        const hasEdges = tab[0].edges.value().length > 0;
	        const hasFaces = tab[0].faces.value().length > 0;
			instance.object.children[0].visible = !hasEdges && !hasFaces;
			//instance.object.children[1].visible = true;
			//instance.object.children[2].visible = true;
		}
		return this;
	}

	run() {
	    this.refresh();
	    window.requestAnimationFrame(() => this.run());
	    return this;
	}

	hide(hide) {
		this.glinstances.forEach(instance => { instance.object.visible = !hide; });
		return this;
	}

	reset() {
		return this;
	}
}
