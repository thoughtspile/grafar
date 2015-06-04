'use strict';
	
(function(global) {
	var _G = global.grafar,
		Style = _G.Style,
		pool = _G.pool,
        isExisty = _G.isExisty,
        asArray = _G.asArray,
        
        Graph = _G.GraphR,
        Reactive = _G.Reactive,
        
        InstanceGL = _G.InstanceGL,
        interleave = _G.interleave,
        resizeBuffer = _G.resizeBuffer;
	
    
    function Object(opts) {
		this.reactives = {};
        this.projections = {};
        
		this.glinstances = [];
        this.graphs = [];
		this.hidden = false;
        this.col = Style.randColor();
	}
		
	Object.prototype.pin = function(panel) {
        var instance = new InstanceGL(panel, this.col);
		this.glinstances.push(instance);
        var graph = new Reactive().lift(function(proj){
            interleave(proj, instance.position);
        }).bind(this.project()) // won't work because of undefined unification
        this.graphs.push(graph);
		return this;
	
	};
    
	Object.prototype.constrain = function(constraint) {
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen || 40;
            
        if (names.length > 1)
            throw new Error('cannot define > 1');
        var sources = this.project(using, true);
        if (!this.reactives.hasOwnProperty(names[0]))
            this.reactives[names[0]] = new Reactive();
        
        var compatibilityAs = function(par, out, l) {
            out.buffer(par.length === 0? maxlen: par[0].length);
            var data = {};
            for (var i = 0; i < using.length; i++)
                data[using[i]] = par[i].value();
            data[names[0]] = out.data;
            as(data, out.length, {});
        };
        
        this.reactives[names[0]]
            .lift(compatibilityAs)
            .bind(sources);

		return this;
	};
	
    Object.prototype.project = function(names, proxy) {
        var names = asArray(names || []);
        var namesHash = names.slice().sort().toString();
        if (!this.projections.hasOwnProperty(namesHash)) {
            var temp = [];
            for (var i = 0; i < names.length; i++) {
                if (!this.reactives.hasOwnProperty(names[i])) {
                    if (proxy)
                        this.reactives[using[i]] = new Reactive();
                    else
                        throw new Error('cannot select undefined');
                }
                temp[i] = this.reactives[names[i]];
            }
            this.projections[namesHash] = Reactive.unify(temp);
        }
		return this.projections[namesHash];
	};
    
	Object.prototype.refresh = function() {
		for (var i = 0; i < this.glinstances.length; i++) {
			var instance = this.glinstances[i];				
			var tab = this.project(instance.panel._axes);
            
            //this.graphs[i].validate();
			interleave(tab, instance.position);
			
			// var edgeCount = tab.indexBufferSize(),
                // hasEdges = (edgeCount !== 0),
                // faceCount = tab.faceCount() * 3,
                // hasFaces = (faceCount !== 0);
			// instance.object.children[1].visible = !hasEdges;
			// instance.object.children[1].visible = hasEdges;
            
			// if (hasEdges) {
				// resizeBuffer(instance.segments, edgeCount);
				// tab.computeIndexBuffer(instance.segments);
				// instance.segments.needsUpdate = true;
			// }
            
            // if (hasFaces) {
                // kinda like
                // interleave(tab.topo.edges, instance.faces);
                //
                // resizeBuffer(instance.faces, faceCount);
                // tab.computeMeshIndex(instance.faces.array);
                // instance.faces.needsUpdate = true;
                
                // resizeBuffer(instance.normals, tab.length * names.length);
                // instance.object.children[2].geometry.computeVertexNormals();
            // }
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