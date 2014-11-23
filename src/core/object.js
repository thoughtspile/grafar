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
		var geometry = new BufferGeometry();
		geometry.addAttribute('position', new BufferAttribute(pool.get(Float32Array, 0), 3));
		geometry.addAttribute('index', new BufferAttribute(pool.get(Uint32Array, 0), 2));
		var object = new Object3D()
			.add(new PointCloud(geometry, this.uniforms.style.getParticleMaterial(this.id)))	
			.add(new Line(geometry, this.uniforms.style.getLineMaterial(this.id), LinePieces));
		panel.scene.add(object);
			
		this.glinstances.push({
				panel: panel,
				target: geometry.getAttribute('position'),
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
			console.log(names, this.db);
			var tab = this.db.select(names);
			instance.resize(tab.length * names.length);
			tab.export(names, instance.target.array);
			instance.target.needsUpdate = true;
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