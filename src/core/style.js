'use strict';

(function(global) {	
	var _G = global.grafar,
		Color = global.Color,
		THREE = global.THREE,
		isExisty = _G.isExisty,
		config = _G.config,
		Observable = _G.Observable,
		makeID = _G.makeID;
		
	var styles = {};
	
	function randomLab() {
		return {
			l: 60,
			a: -100 + Math.floor(200 * Math.random()),
			b: -100 + Math.floor(200 * Math.random())
		};
	}
	
	function Style(init) {
		Observable.call(this);
		
		init = init || {};
			
		this.id = init.id || makeID(styles);		
		styles[this.id] = this;
		
		this.alpha = null;
		this.start = null;
		this.end = null;
		
		this.points = null;
		this.radius = null;
		
		this.lines = null;
		
		this.palette = [];
		this.colors = {};
		this.materials = {};
		
		this.update(init);
		this.samplePalette(init.paletteSize);
		
		return this;
	}
	
	Style.prototype = new Observable();
	
	Style.prototype.samplePalette = function(paletteSize) {
		paletteSize = paletteSize || 10;
		for (var i = 0; i < paletteSize; i++) {
			var rgb = Color.convert(randomLab(), 'rgb'),
				rgb2 = new THREE.Color('rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
			this.palette.push(rgb2);
		}
		return this;
	};
	
	Style.prototype.pull = function(id) {
		this.materials[id] = {
			line: new THREE.LineBasicMaterial({}),
			point: new THREE.PointCloudMaterial({size: config.particleRadius, transparent: true, opacity: 0.5, sizeAttenuation: false})
		};		
		this.colors[id] = this.palette[(Object.getOwnPropertyNames(this.colors).length + 1) % this.palette.length];
		this.updateMaterials(id);
	};
	
	Style.prototype.updateMaterials = function(id) {
		this.materials[id].line.color = this.colors[id];
		this.materials[id].point.color = this.colors[id];
		this.materials[id].line.needsUpdate = true;
		this.materials[id].point.needsUpdate = true;
	};
	
	Style.prototype.setPalette = function(palette) {
		this.palette = palette.map(function(col) {
			return new THREE.Color(col);
		});
		return this;
	};
	
	Style.prototype.update = function(styleChanges) {
		Object.getOwnPropertyNames(styleChanges || {}).forEach(function(name) {
			if (this.hasOwnProperty(name))
				this[name] = styleChanges[name];
		}.bind(this));
		
		return this;
	};
		
	Style.prototype.getLineMaterial = function(id) {
		id = id || 'def';
		if (!isExisty(this.colors[id]))
			this.pull(id);
		return this.materials[id].line;
	};
	
	Style.prototype.getParticleMaterial = function(id) {
		id = id || 'def';
		if (!isExisty(this.colors[id]))
			this.pull(id);
		return this.materials[id].point;
	};
		
	_G.styles = styles;
	_G.Style = Style;
}(this));