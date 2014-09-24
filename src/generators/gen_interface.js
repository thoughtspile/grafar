'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		Observable = _G.Observable,
		isExisty = _G.isExisty;
	
	var generators = {};
	
	function Generator() {
		Observable.call(this);
	}
	
	Generator.prototype = new Observable();
	
	Generator.prototype.set = function() {
	};
	
	Generator.prototype.update = function() {
	};
	
	Generator.prototype.execute = function() {
	};
	
	// exports
	
	_G.generators = generators;
	_G.Generator = Generator;
}(this));