'use strict';

(function(global) {	
	var _G = global.grafar,
		THREE = global.THREE,
		makeID = _G.makeID,
		Style = _G.Style,
		Panel = _G.Panel,
		config = _G.config,
		isExisty = _G.isExisty,
		Observable = _G.Observable,
		pool = _G.pool;
	
	var graphs = {};
	
	// *** constructor ***
	function Graph(gConfig) {
		Observable.call(this);
	
		gConfig = gConfig || {};
		
		this.id = gConfig.id || makeID(graphs);		
		graphs[this.id] = this;
			
		this.parent = null;
		this.children = [];
			
		this.panel = null;
		this.style = this.id !== config.rootGraphId? graphs[config.rootGraphId].style: new Style();
		this.hidden = null;
			
		var geometry = new THREE.BufferGeometry();		
		geometry.addAttribute('position', new THREE.BufferAttribute(pool.get(Float32Array, 0), 3));
		geometry.addAttribute('index', new THREE.BufferAttribute(pool.get(Uint32Array, 0), 2));
			
		this.object = new THREE.Object3D()
			.add(new THREE.PointCloud(geometry, this.style.getParticleMaterial(this.id)))
			.add(new THREE.Line(geometry, this.style.getLineMaterial(this.id), THREE.LinePieces));
			
		this.setup(gConfig);
			
		return this;
	}
	
	Graph.prototype = new Observable();

	
	// data interface
	
	function AttributeWrapper(attribute, names) {
		this.names = names;
		this.target = attribute;
	}
	
	AttributeWrapper.prototype = {
		get array () {
			return this.target.array;
		},
		get length () {
			return this.target.array.length;
		},
		set length (val) {
			var oldArr = this.target.array,
				oldVal = oldArr.length;
			if (val !== oldVal) {
				var temp = pool.get(oldArr.constructor, val);
				// do we really need to copy?
				temp.set(oldArr.subarray(0, Math.min(oldVal, val)));
				pool.push(this.target.array);
				this.target.array = temp;
			}
		},
		update: function() {
			this.target.needsUpdate = true;
			return this;
		}
	};
	
	Graph.prototype.dataInterface = function() {
		var objects = this.object.children,
			panel = this.query('panel');
		this._dataInterface = this._dataInterface || {
			buffers: [
				new AttributeWrapper(objects[1].geometry.getAttribute('position'), isExisty(panel)?  panel._axes: []),
				new AttributeWrapper(objects[1].geometry.getAttribute('index'), ['$i'])
			]
		};
		return this._dataInterface;
	};
	
	
	// the new interface 
	
	Graph.prototype.data = function(table) {
		this.dataInterface().buffers.forEach(function(buffer) {
			table.postRequest(buffer.names);
			
			if (buffer.names.indexOf('$i') === -1)
				table.on('update', function() {
					buffer.length = table.length * buffer.names.length;  // look out for 2D -- all is OK, but still
					table.select(buffer.names, buffer.array);
					buffer.update();
				});
			else
				table.on('update', function() {
					buffer.length = table.indexBufferSize();
					table.computeIndexBuffer(buffer.array);
					buffer.update();
				});
		});
		
		return this;
	};
	
	Graph.prototype.enable = function(attr, alias) {
	};
	
	Graph.prototype.disable = function(attr, alias) {
	};
	
	
	// *** setters ***
	
	Graph.prototype.addChild = function(child) {
		this.children.push(child);
		return this;
	};
	
	Graph.prototype.removeChild = function(child) {
		this.children.splice(this.children.indexOf(child), 1);
		return this;
	};
	
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
	};
	
	Graph.prototype.setPanel = function(panel) {
		if (this.query('panel'))
			this.query('panel').scene.remove(this.object);
			
		if (panel instanceof Panel)
			this.panel = panel;
		
		panel = this.query('panel');
		if (isExisty(panel)) {
			panel.scene.add(this.object);		
			// woah!
			this.dataInterface().buffers[0].names = panel._axes;
		}
		
		this.children.forEach(function(child) {
			child.setPanel();
		});
		
		return this;
	};
	
	Graph.prototype.setHiding = function(hide) {
		if (isExisty(hide))
			this.hidden = hide;
		this.object.visible = !this.query('hidden');
		
		this.children.forEach(function(child) {
			child.setHiding();
		});		
		return this;
	};
	
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
	};
	
	Graph.prototype.setup = function(config) {
		config = config || {};
		
		this.setParent(config.parent);
		this.setPanel(config.panel);
		this.setStyle(config.style);
		this.setHiding(config.hide);
		
		return this;
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
	};

	
	// *** default (root) graph ***
	// don't use "new" for side effects
	new Graph({
		id: config.rootGraphId,
		style: new Style(),
		hide: false
	});
	
	
	// export
	
	_G.graphs = graphs;
	_G.Graph = Graph;
}(this));