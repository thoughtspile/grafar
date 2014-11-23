'use strict';

(function(global) {
	var _G = global.grafar,
		union = _G.union;
	
	function GraphData() {
		this.names = {};
		this.from = {};
		this.to = {};
	}
	
	GraphData.prototype.addNode = function(name) {
		if (!this.names[name]) {
			this.names[name] = true;
			this.from[name] = [];
			this.to[name] = [];
		}
		
		return this;
	};
	
	GraphData.prototype.addEdge = function(v1, v2) {
		this.addNode(v1);
		this.addNode(v2);
		if (this.from[v1].indexOf(v2) === -1)
			this.from[v1].push(v2);
		if (this.to[v2].indexOf(v1) === -1)
			this.to[v2].push(v1);
		return this;
	};
	
	GraphData.prototype.parents = function(vset) {
		var par = [];
		for (var i = 0; i < vset.length; i++)
			par = union(par, this.to[vset[i]]);
		return par;
	};
	
	GraphData.prototype.up = function(sources) {
		var closed = [],
			open = sources.slice(),
			self = this;
		while (open.length !== 0) {
			open = open.reduce(function(pv, cv) {
				return union(self.to[cv], pv);
			}, []);
			closed = union(closed, open);
		};
		return closed;
	};
	
	GraphData.prototype.down = function(sinks) {
		var closed = [],
			open = sinks.slice(),
			self = this;
		while (open.length !== 0) {
			open = open.reduce(function(pv, cv) {
				return union(self.from[cv], pv);
			}, []);
			closed = union(closed, open);
		};
		return closed;
	};
	
	_G.GraphData = GraphData;
}(this));