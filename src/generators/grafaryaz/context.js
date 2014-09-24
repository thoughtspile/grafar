'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		isExisty = _G.isExisty,
		Generator = _G.Generator,
		generators = _G.generators,
		MathSystem = _G.MathSystem;
	
	
	function Cont() {
		Generator.call(this);
		
		this.core = null;
		this.buffers = [];
		this.target = [];
		this.indexNeeded = false;
		this.onUpdate = [];
	}
	
	Cont.prototype = new Generator();
	
	Cont.prototype.set = function(str) {
		this.core = new MathSystem(str, this.target);
		this.sample();
	};
	
	Cont.prototype.sample = function() {
		var temp = this.core.sample();
		
		this.buffers.forEach(function(wrapper) {
			if (wrapper.names.indexOf('$i') === -1) {
				wrapper.length = temp.length * wrapper.names.length;  // look out for 2D
				temp.select(wrapper.names, wrapper.array);
			} else {
				wrapper.length = temp.indexBufferSize();
				temp.computeIndexBuffer(wrapper.array);
			}
		});
		
		temp.dropAll();
		
		this.onUpdate.forEach(function(action) {
			action();
		});
		
		return temp;
	};
	
	Cont.prototype.bindBuffer = function(wrapper) {
		this.buffers.push(wrapper);
		if (wrapper.names.indexOf('$i') === -1)
			this.target = union(this.target, wrapper.names.filter(isExisty));
		else
			this.indexNeeded = true;
	};
	
	
	// exports
	
	generators.Cont = Cont;
}(this));