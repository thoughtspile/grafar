'use strict';
	
(function(global) {
	var _G = global.grafar,
		_T = global.THREE,
		
		Database = _G.Database,
		Style = _G.Style,
		Observable = _G.Observable,
		pool = _G.pool,
		
		Object3D = _T.Object3D,
		PointCloud = _T.PointCloud,
		Line = _T.Line,
		LinePieces = _T.LinePieces,
		BufferGeometry = _T.BufferGeometry,
		BufferAttribute = _T.BufferAttribute;
	
    
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
        this.target = position;
        this.index = lineIndex;
        this.meshIndex = meshIndex;
        this.normal = normal;
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
		Observable.call(this);
		
		this.db = new Database();
		this.uniforms = {
			style: new Style()
		};
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
            resizeBuffer(instance.target, tab.length * names.length);
			tab.export(names, instance.target.array);
			instance.target.needsUpdate = true;
			
			var edgeCount = tab.indexBufferSize(),
                hasEdges = (edgeCount !== 0);
			instance.object.children[0].visible = !hasEdges;
			instance.object.children[1].visible = hasEdges;
			if (hasEdges) {
				resizeBuffer(instance.index, edgeCount);
				tab.computeIndexBuffer(instance.index);
				instance.index.needsUpdate = true;
			}
            
            if (tab.isMeshable()) {
                var faceCount = tab.faceCount() * 3;
                resizeBuffer(instance.meshIndex, faceCount);
                resizeBuffer(instance.normal, tab.length * names.length);
                tab.computeMeshIndex(instance.meshIndex.array);
                instance.object.children[2].geometry.computeVertexNormals();
            }
		}
		return this;
	}
	
    Object.prototype.reset = function() {
        return this;
    };
    
	Object.prototype.hide = function(hide) {
		for (var i = 0; i < this.glinstances.length; i++)
			this.glinstances[i].object.visible = !hide;
		return this;
	}
			
	_G.Object = Object;
}(this));