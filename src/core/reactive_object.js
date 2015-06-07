'use strict';
	
(function(global) {
	var _G = global.grafar,
		Style = _G.Style,
		pool = _G.pool,
        isExisty = _G.isExisty,
        asArray = _G.asArray,
        nunion = _G.nunion,
        baseTranslate = _G.baseTranslate,
        pathGraph = _G.pathGraph,
        emptyGraph = _G.emptyGraph,
        cartesianGraphProd = _G.cartesianGraphProd,
        
        Graph = _G.GraphR,
        Reactive = _G.Reactive,
        
        InstanceGL = _G.InstanceGL,
        interleave = _G.interleave,
        resizeBuffer = _G.resizeBuffer;
	
    
    function Object(opts) {
		this.datasets = {};
        this.projections = {};
        
		this.glinstances = [];
        //this.graphs = [];
		this.hidden = false;
        this.col = Style.randColor();
	}
		
	Object.prototype.pin = function(panel) {
        var instance = new InstanceGL(panel, this.col);
		this.glinstances.push(instance);
        // var graph = new Reactive().lift(function(proj){
            // interleave(proj, instance.position);
        // }).bind(this.project()) // won't work because of undefined unification
        //this.graphs.push(graph);
		return this;
	
	};
    
	Object.prototype.constrain = function(constraint) {
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen || 40,
            discrete = constraint.discrete || false;
            
        if (names.length > 1)
            throw new Error('cannot define > 1');
        var sources = this.project(using, true);
        // I only do this shit because project forces product
        // however, if it doesn't (force), memo would have to go into unify
        // which sucks as well
        for (var i = 0; i < names.length; i++)
            if (!this.datasets.hasOwnProperty(names[0]))
                this.datasets[names[i]] = new Graph();
        
        var compatibilityAs = function(par, out) {
            resizeBuffer(out, par.length === 0? maxlen: par[0].length);
            var data = {};
            for (var i = 0; i < using.length; i++)
                data[using[i]] = par[i].array;
            for (var i = 0; i < names.length; i++)
                data[names[i]] = out.array;
            as(data, out.length, {});
        };
                
        this.datasets[names[0]].base
            .lift(Graph.baseTranslate)
            .bind(sources.map(function(src) {
                return src.base;
            }));
            
        this.datasets[names[0]].data
            .lift(compatibilityAs)
            .bind(sources.map(function(src) {
                return src.data;
            }));
            
        if (sources.length === 0) {
            this.datasets[names[0]].edges.data.pointCount = maxlen;
            this.datasets[names[0]].edges.lift(discrete? emptyGraph: pathGraph);
        } else {
            this.datasets[names[0]].edges
                .lift(function(src, targ) {
                    targ.pointCount = src[0].pointCount;
                    resizeBuffer(targ, src[0].length);
                    targ.array.set(src[0].array);
                })
                .bind(sources.map(function(src) {
                    return src.edges;
                }));
        }

		return this;
	};
	
    Object.prototype.project = function(names, proxy) {
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
	};
    
	Object.prototype.refresh = function() {
		for (var i = 0; i < this.glinstances.length; i++) {
			var instance = this.glinstances[i];				
			var tab = this.project(instance.panel._axes);
            
			interleave(tab.map(function(c) {return c.data.value()}), instance.position);
			
            interleave([tab[0].edges.value()], instance.segments);
            interleave([tab[0].faces.value()], instance.faces);
            
            resizeBuffer(instance.normals, tab[0].data.value().length * 3);
            instance.object.children[2].geometry.computeVertexNormals();
            
			instance.object.children[0].visible = false;
			instance.object.children[1].visible = true;
			instance.object.children[2].visible = true;            
		}
		return this;
	};
    
	Object.prototype.hide = function(hide) {
		for (var i = 0; i < this.glinstances.length; i++)
			this.glinstances[i].object.visible = !hide;
		return this;
	};
        
        
	_G.ObjectR = Object;
}(this));