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
	
	
	function Object(opts) {
		Observable.call(this);
		
		this.db = new Database();
		this.uniforms = {
			style: new Style()
		};
		this.glinstances = [];
		this.hidden = false;
	}
	
	Object.prototype = new Observable();
	
	Object.prototype.pin = function(panel) {
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
		
		// lame color
		var meshMaterial = new THREE.MeshLambertMaterial({
			side: THREE.DoubleSide,
			color: 0xffffff
		});
		var object = new Object3D()
			.add(new PointCloud(pointGeometry, this.uniforms.style.getParticleMaterial(this.id)))	
			.add(new Line(lineGeometry, this.uniforms.style.getLineMaterial(this.id), LinePieces))
			.add(new THREE.Mesh(meshGeometry, meshMaterial));
		
		panel.scene.add(object);
			
		this.glinstances.push({
				panel: panel,
				target: position,
				index: lineIndex,
				meshIndex: meshIndex,
				normal: normal,
				object: object,
				resize: function(size) {
					var oldArr = this.target.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.target.array);
						this.target.array = temp;
					}
				},
				resizeIndex: function(size) {
					var oldArr = this.index.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.index.array);
						this.index.array = temp;
					}
				},
				resizeMeshIndex: function(size) {
					var oldArr = this.meshIndex.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.meshIndex.array);
						this.meshIndex.array = temp;
					}
				},
				resizeNormals: function(size) {
					var oldArr = this.normal.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.normal.array);
						this.normal.array = temp;
					}
				}
			}
		);
		
		//var self = this;
		//panel.on('update', function() {self.db.refresh();});
		//this.db.on('update', function() {});
		
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
			instance.resize(tab.length * names.length);
			tab.export(names, instance.target.array);
			instance.target.needsUpdate = true;
			
			 var edgeCount = tab.indexBufferSize(),
				 hasEdges = (edgeCount !== 0);
			instance.object.children[0].visible = !hasEdges;
			instance.object.children[1].visible = hasEdges;
			console.log('yep');
			if (hasEdges) {
				instance.resizeIndex(edgeCount);
				tab.computeIndexBuffer(instance.index);
				instance.index.needsUpdate = true;
			}
			
			// var faceCount = 2*30*50*16*3;//tab.indexBufferSize(),
			// instance.object.children[0].visible = false;
			// instance.object.children[1].visible = false;
			// if (true) {
				// instance.resizeMeshIndex(faceCount);
				// instance.resizeNormals(tab.length * names.length);
				// tab.computeMeshIndex(instance.meshIndex.array);
				// instance.object.children[2].geometry.computeVertexNormals();
			// }
		}
		return this;
	}
	
	Object.prototype.hide = function(hide) {
		for (var i = 0; i < this.glinstances.length; i++)
			this.glinstances[i].object.visible = !hide;
		return this;
	}
			
	_G.Object = Object;
}(this));