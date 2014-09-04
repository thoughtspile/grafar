'use strict';

(function(global) {	
	var _G = global.grafar || (global.grafar = {});
	
	var makeID = _G.makeID,
		Style = _G.Style,
		Geometry = _G.Geometry,
		Panel = _G.Panel,
		panels = _G.panels,
		Symfun = _G.Symfun,
		config = _G.config,
		isExisty = _G.isExisty;
	
	var graphs = {};
	
	// *** constructor ***
	function Graph(gConfig) {
		gConfig = gConfig || {};
		
		this.id = gConfig.id || makeID(graphs);		
		graphs[this.id] = this;
			
		this.parent = null;
		this.children = [];
			
		this.panel = null;
		this.style = this.id !== config.rootGraphId? graphs[config.rootGraphId].style: new Style();
		this.hidden = null;
			
		var geometry = new THREE.BufferGeometry();		
		geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
		geometry.addAttribute('index', new THREE.BufferAttribute(new Uint32Array(0), 2));
			
		this.object = new THREE.Object3D()
			.add(new THREE.PointCloud(geometry, this.style.getParticleMaterial(this.id)))
			.add(new THREE.Line(geometry, this.style.getLineMaterial(this.id), THREE.LinePieces));
			
		this.setup(gConfig);
		this.dataInterface();
			
		return this;
	}
	
	// data interface	
	function AttributeWrapper(attribute, constructor, names) {
		this.names = names;
		this.target = attribute;
		this.constructor = constructor;
	}
	
	AttributeWrapper.prototype = {
		get array () {
			return this.target.array;
		},
		get length () {
			return this.target.array.length;
		},
		set length (val) {
			if (val !== this.target.array.length) {
				var temp = new this.constructor(val);
				temp.set(this.target.array.subarray(0, val));
				this.target.array = temp;
			}
		}
	}
	
	Graph.prototype.dataInterface = function() {
		var objects = this.object.children,
			panel = this.query('panel');
		this._dataInterface = this._dataInterface || {
			buffers: {
				vertex: new AttributeWrapper(objects[1].geometry.getAttribute('position'), Float32Array, isExisty(panel)?  panel._axes: []),
				index: new AttributeWrapper(objects[1].geometry.getAttribute('index'), Uint32Array, ['$i'])
			},
			update: function() {
					objects[0].geometry.getAttribute('position').needsUpdate = true;
					objects[1].geometry.getAttribute('position').needsUpdate = true;
					objects[1].geometry.getAttribute('index').needsUpdate = true;
				},
			transactionActive: false,
			morphActive: false
		};
		return this._dataInterface;
	};
	
	
	// *** setters ***
	Graph.prototype.addChild = function(child) {
		this.children.push(child);
		return this;
	}
	
	Graph.prototype.removeChild = function(child) {
		this.children.splice(this.children.indexOf(child), 1);
		return this;
	}
	
	Graph.prototype.setParent = function(parent) {
		if (isExisty(this.parent))
			this.parent.removeChild(this);
		
		if (this.id === config.rootGraphId)
			parent = null;
		else if (!isExisty(parent))
			parent = graphs[config.rootGraphId];
		
		this.parent = parent;
		if (isExisty(this.parent))
			this.parent.addChild(this);
		
		this.setHiding();
		this.setPanel();
		this.setStyle();
			
		return this;
	}
	
	Graph.prototype.setPanel = function(panel) {
		if (this.query('panel'))
			this.query('panel').scene.remove(this.object);
			
		if (typeof panel === 'string' && panels.hasOwnProperty(panel))
			this.panel = panels[panel];
		else if (panel instanceof Panel)
			this.panel = panel;
		
		var panel = this.query('panel');
		if (isExisty(panel)) {
			panel.scene.add(this.object);		
			this.dataInterface().buffers['vertex'].names = panel._axes;
		}
		
		this.children.forEach(function(child) {
			child.setPanel();
		});
		
		return this;
	}
	
	Graph.prototype.setHiding = function(hide) {
		if (isExisty(hide))
			this.hidden = hide;
		this.object.visible = !this.query('hidden');
		
		this.children.forEach(function(child) {
			child.setHiding();
		});		
		return this;
	}
	
	Graph.prototype.setStyle = function(newStyle) {
		// this.style.drop();
		
		if (isExisty(newStyle)) {
			this.style = newStyle;
		} else if (this.id !== '$') {
			this.style = this.parent.style;
		} else {
			this.style = new Style();
		}
		this.object.children[0].material = this.style.getParticleMaterial(this.id);
		this.object.children[1].material = this.style.getLineMaterial(this.id);
		
		this.children.forEach(function(child) {
			child.setStyle();
		});
		return this;
	}
	
	Graph.prototype.setup = function(config) {
		config = config || {};
		
		this.setParent(config.parent);
		this.setPanel(config.panel);
		this.setStyle(config.style);
		this.setHiding(config.hide);
		
		// redraw
		//this.update();
		return this;
	}
	
	Graph.prototype.update = function() {
	};
	
	// *** inheritance ***
	Graph.prototype.query = function(key) {
		var path = key.split('.'), temp = this;
		for (var i = 0; i < path.length; i++)
			if (isExisty(temp[path[i]]))
				temp = temp[path[i]];
			else if (this.parent)
				return this.parent.query(key);
			else
				return null;
		return temp;
	}

	// some useful thingies:
	//   someGeometry.attributes.position.needsUpdate = true; to update
	//   someGeometry.dispose(); might be useful n some way
	

	// *** default (root) graph ***
	new Graph({
		id: config.rootGraphId,
		style: new Style(),
		hide: false
	});
	
	
	// export
	_G.graphs = graphs;
	_G.Graph = Graph;
}(this));