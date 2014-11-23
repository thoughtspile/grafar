'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		Observable = _G.Observable,
		Table2 = _G.Table2,
		isExisty = _G.isExisty;
	
	var generators = {};
	
	function Generator() {
		Observable.call(this);
		this.actions = [];
	}
	
	Generator.prototype = new Observable();
	
	Generator.prototype.set = function() {
	};
	
	Generator.prototype.update = function() {
	};
	
	Generator.prototype.execute = function(table) {
		table = table || this.table || new Table2();
		
		var queue = this.actions;
		for (var i = 0; i < queue.length; i++)
			queue[i](table);
		
		return table;
	};
	
	Generator.prototype.data = function(table) {
		this.table = table;
		return this;
	};
	
	
	// exports
	
	_G.generators = generators;
	_G.Generator = Generator;
}(this));