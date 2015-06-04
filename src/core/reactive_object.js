'use strict';
	
(function(global) {
	var _G = global.grafar,		
		Database = _G.Database,
		Style = _G.Style,
		pool = _G.pool,
        isExisty = _G.isExisty,
        Graph = _G.GraphR,        
        DatabaseR = _G.DatabaseR,
        InstanceGL = _G.InstanceGL,
        interleave = _G.interleave,
        resizeBuffer = _G.resizeBuffer;
	
	function Object(opts) {
		this.db = new DatabaseR();
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
		this.db.constrain(constraint);
		return this;
	};
	
	Object.prototype.refresh = function() {
		for (var i = 0; i < this.glinstances.length; i++) {
			var instance = this.glinstances[i],
				names = instance.panel._axes;
				
			var tab = this.db.select(names);
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