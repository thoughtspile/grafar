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
	    var instance = new InstanceGL(panel, this.col);
		this.glinstances.push(instance);
	    // var graph = new Reactive().lift(function(proj){
	        // interleave(proj, instance.position);
	    // }).bind(this.project()) // won't work because of undefined unification
	    //this.graphs.push(graph);
		return this;
	}

	constrain(constraint) {
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || (() => {}),
			maxlen = constraint.maxlen || 40,
	        discrete = constraint.discrete || false;

		//debugger;
	    var sources = this.project(using, true);
	    // I only do this shit because project forces product
	    // however, if it doesn't (force), memo would have to go into unify
	    // which sucks even worse
	    for (var i = 0; i < names.length; i++)
	        if (!this.datasets.hasOwnProperty(names[i]))
	            this.datasets[names[i]] = new Graph();

	    var computation = new Graph();
	    computation.data = new Reactive({
	            buffers: names.map(() => new Buffer()),
	            length: 0
	        })
	        .lift((par, out) => {
	            var data = {};
	            for (var i = 0; i < using.length; i++)
	                data[using[i]] = par[i].array;
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

	    for (var i = 0; i < names.length; i++) {
	        var dataset = this.datasets[names[i]];

	        dataset.base = computation.base;
	        dataset.edges = computation.edges;

	        (function(iLoc) {
	            dataset.data
	                .lift((src, target) => {
	                    target.length = src[0].buffers[iLoc].length;
	                    target.array = src[0].buffers[iLoc].array;
	                })
	                .bind([computation.data]);
	        }(i));
	    }

		return this;
	}

	colorize(args) {
		var using = asArray(args.using || []),
			as = args.as || (() => {});

		var data = {},
			len;
		for (var i = 0; i < using.length; i++) {
			data[using[i]] = this.datasets[using[i]].data.value().array;
		}
		var buf = this.glinstances[0].color,
			len = this.project(this.glinstances[0].panel._axes)[0].data.value().length;
		resizeBuffer(buf, len * 3);
		// this should become as reactive as the Up-Goer 5
		as(buf.array, data, len);
		return this;
	}

	project(names, proxy) {
	    var names = asArray(names || []);
	    var namesHash = names.slice().sort().toString();
	    if (!this.projections.hasOwnProperty(namesHash)) {
	        var temp = [];
	        for (var i = 0; i < names.length; i++) {
	            if (!this.datasets.hasOwnProperty(names[i])) {
	                if (proxy)
	                    this.datasets[using[i]] = new Graph();
	                else
	                    throw new Error('cannot select undefined');
	            }
	            temp[i] = this.datasets[names[i]];
	        }
	        this.projections[namesHash] = Graph.unify(temp);
	    }
		return this.projections[namesHash];
	}

	refresh() {
		for (var i = 0; i < this.glinstances.length; i++) {
			var instance = this.glinstances[i];
			var tab = this.project(instance.panel._axes, false);
	        if (tab.every(col => col.data.isValid)) {
	            console.log('othing to see here');
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

	        var hasEdges = tab[0].edges.value().length > 0;
	        var hasFaces = tab[0].faces.value().length > 0;
			instance.object.children[0].visible = !(hasEdges || hasFaces);
			//instance.object.children[1].visible = true;
			//instance.object.children[2].visible = true;
		}
		return this;
	}

	run() {
	    this.refresh();
	    window.requestAnimationFrame(this.run.bind(this));
	    return this;
	}

	hide(hide) {
		for (var i = 0; i < this.glinstances.length; i++)
			this.glinstances[i].object.visible = !hide;
		return this;
	}

	reset() {
		return this;
	}
}
