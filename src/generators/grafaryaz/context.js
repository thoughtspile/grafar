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
		 // TODO catchall target
		this.actions = new MathSystem(str, table.requests.filter(function(n) { return n !== '$i'; })).plan.sequence();
		
		this.execute(table);
		
		table.dispatch('update');
				
		// reset table
		// check async
		table.dropAll();
				
		return this;
	};
		
	
	// exports
	
	generators.Cont = Cont;
}(this));