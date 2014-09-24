'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		isExisty = _G.isExisty,
		Generator = _G.Generator,
		MathSystem = _G.MathSystem;
	
	
	function Context() {
		Generator.call(this);
		
		this.core = null;
		this.buffers = [];
		this.target = [];
		this.indexNeeded = false;
		this.onUpdate = [];
	}
	
	Context.prototype = new Generator();
	
	Context.prototype.set = function(str) {
		this.core = new MathSystem(str, this.target);
		this.sample();
	};
	
	Context.prototype.sample = function() {
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
	
	Context.prototype.bindBuffer = function(wrapper) {
		this.buffers.push(wrapper);
		if (wrapper.names.indexOf('$i') === -1)
			this.target = union(this.target, wrapper.names.filter(isExisty));
		else
			this.indexNeeded = true;
	};
	
	
	// exports
	
	_G.Context = Context;
}(this));