(function(global) {	
	var _GY = global.grafaryaz || (global.grafaryaz = {}),
		union = _GY.union,
		MathSystem = _GY.MathSystem;
	
	
	Context = function() {
		this.core = null;
		this.buffers = [];
		this.target = [];
		this.indexNeeded = false;
		this.onUpdate = [];
	}
	
	Context.prototype.set = function(str) {
		this.core = new MathSystem(str, this.target);
		this.sample();
	}
	
	Context.prototype.sample = function() {
		var temp = this.core.sample();
		
		this.buffers.forEach(function(wrapper) {
			if (wrapper.names.indexOf('$i') === -1) {
				wrapper.length = temp.data.length * 3;
				temp.asTypedArray(wrapper.names, wrapper.array);
			} else {
				if (temp.gDesc.indexOf('c') !== -1)
					wrapper.length = 40000; // upper bound is lousy
				else
					wrapper.length = 0;
				//console.log('RESIZED GO HERE FIX THIS SHIT', wrapper.array);
				temp.computeIndexBuffer(wrapper.array);
			}
		});
		
		this.onUpdate.forEach(function(action) {
			action();
		});
		
		return temp;
	}
	
	Context.prototype.bindBuffer = function(wrapper) {
		this.buffers.push(wrapper);		
		if (wrapper.names.indexOf('$i') === -1)
			this.target = union(this.target, wrapper.names);
		else
			this.indexNeeded = true;
	}
	
	
	// exports
	
	_GY.Context = Context;
}(this));