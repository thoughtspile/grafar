'use strict';
	
(function(global) {
	var _G = global.grafar,
		_T = global.THREE,
		
		Database = _G.Database,
		Style = _G.Style,
		pool = _G.pool,
        isExisty = _G.isExisty,
        
        DatabaseR = _G.DatabaseR,
		
		Object3D = _T.Object3D,
		PointCloud = _T.PointCloud,
		Line = _T.Line,
		LinePieces = _T.LinePieces,
		BufferGeometry = _T.BufferGeometry,
		BufferAttribute = _T.BufferAttribute;
	
    function interleave(tab, names, target) {
        var len = tab[names[0]].length,
            itemsize = names.length;
		for (var j = 0; j < itemsize; j++) {
			if (isExisty(names[j])) {
				var colData = tab[names[j]].value();
				for (var i = 0, k = j; i < len; i++, k += itemsize)
					target[k] = colData[i];
			}
		}
    };
    
    
    function InstanceGL(panel) {
        var pointGeometry = new BufferGeometry(),
			lineGeometry = new BufferGeometry(),
			meshGeometry = new BufferGeometry(),
			position = new BufferAttribute(pool.get(Float32Array, 0), 3),
			lineIndex = new BufferAttribute(pool.get(Uint32Array, 0), 2),
			meshIndex = new BufferAttribute(pool.get(Uint32Array, 0), 3),
			normal = new BufferAttribute(pool.get(Float32Array, 0), 3);
			
		pointGeometry.addAttribute('position', position);
		lineGeometry.addAttribute('position', position);
		meshGeometry.addAttribute('position', position);
		lineGeometry.addAttribute('index', lineIndex);
		meshGeometry.addAttribute('index', meshIndex);
		meshGeometry.addAttribute('normal', normal);
		
		var col = Style.randColor(),
            object = new Object3D();
        object.add(new PointCloud(pointGeometry, Style.matHelper('point', col)))
            .add(new Line(lineGeometry, Style.matHelper('line', col), LinePieces))
            .add(new THREE.Mesh(meshGeometry, Style.matHelper('mesh', col)));
		panel.scene.add(object);
        
        this.panel = panel;
        this.position = position;
        this.segments = lineIndex;
        this.faces = meshIndex;
        this.normals = normal;
        this.object = object;
    };
    
    function resizeBuffer(buffer, size) {
        var oldArr = buffer.array,
            oldSize = oldArr.length;
        if (size !== oldSize) {
            var temp = pool.get(oldArr.constructor, size);
            temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
            pool.push(buffer.array);
            buffer.array = temp;
        }
    };
    
	
	function Object(opts) {
		this.db = new DatabaseR();
		this.glinstances = [];
		this.hidden = false;
	}
		
	Object.prototype.pin = function(panel) {			
		this.glinstances.push(new InstanceGL(panel));
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