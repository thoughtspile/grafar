'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		Table2 = _G.Table2,
		isExisty = _G.isExisty,
		Generator = _G.Generator,
		generators = _G.generators,
		MathSystem = _G.MathSystem;
	
	
	function Cont() {
		Generator.call(this);
		this.buffers = [];
	}
	
	Cont.prototype = new Generator();
	
	Cont.prototype.set = function(str, table) {
		var target = this.buffers.reduce(function(pv, buffer) {
			return union(pv, buffer.names.filter(function(n) {
				return isExisty(n) && n !== '$i';
			}));
		}, []);
		
		this.actions = new MathSystem(str, target).plan.sequence();
		
		var temp = this.execute(table || new Table2());
		
		// export to buffers
		this.buffers.forEach(function(wrapper) {
			if (wrapper.names.indexOf('$i') === -1) {
				// request resize
				wrapper.length = temp.length * wrapper.names.length;  // look out for 2D -- all is OK, but still
				// export to buffer
				temp.select(wrapper.names, wrapper.array);
			} else {
				wrapper.length = temp.indexBufferSize();
				temp.computeIndexBuffer(wrapper.array);
			}
		});
		
		// reset table
		temp.dropAll();
		
		// set update flags in buffers
		this.dispatch('update');
		//table.dispatch('update');
		
		return temp;
	};
		
	
	// exports
	
	generators.Cont = Cont;
}(this));