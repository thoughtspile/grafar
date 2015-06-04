'use strict';
	
(function(global) {
	var _G = global.grafar,
		Style = _G.Style,
		pool = _G.pool,
        isExisty = _G.isExisty,
        Graph = _G.GraphR,
        asArray = _G.asArray,
        Reactive = _G.Reactive,
        InstanceGL = _G.InstanceGL,
        interleave = _G.interleave,
        resizeBuffer = _G.resizeBuffer;
	
    
	function Object(opts) {
		this.reactives = {};
        
		this.glinstances = [];
        this.graphs = [];
		this.hidden = false;
        this.col = Style.randColor();
	}
		
	Object.prototype.pin = function(panel) {
		this.glinstances.push(new InstanceGL(panel, this.col));
        this.graphs.push(new Graph());
		return this;
	};
	
	Object.prototype.constrain = function(constraint) {
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen;
            
        if (names.length > 1)
            throw new Error('cannot define > 1');
        var sources = [];
        for (var i = 0; i < using.length; i++) {
            if (!this.reactives.hasOwnProperty(using[i]))
                this.reactives[using[i]] = new Reactive();
            sources[i] = this.reactives[using[i]];
        }
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
            .bind(Reactive.unify(sources));

		return this;
	};
	
    Object.prototype.select = function(names) {
        var names = asArray(names || []);
        var temp = [];        
        for (var i = 0; i < names.length; i++) {
            if (!this.reactives.hasOwnProperty(names[i]))
                throw new Error('cannot select undefined');
            temp[i] = this.reactives[names[i]];
        }
		var unifiedReactives = Reactive.unify(temp);
        var data = {};
        for (var i = 0; i < names.length; i++)
            data[names[i]] = unifiedReactives[i].validate();
        return data;
	};
    
	Object.prototype.refresh = function() {
		for (var i = 0; i < this.glinstances.length; i++) {
			var instance = this.glinstances[i],
				names = instance.panel._axes;
				
			var tab = this.select(names);
            resizeBuffer(instance.position, tab[names[0]].length * names.length);
			interleave(tab, names, instance.position.array);
			instance.position.needsUpdate = true;
			
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