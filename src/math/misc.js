'use strict';

(function(global) {
	var _G = global.grafar;
	
			
	function makeID(obj) {
		while (true) {
			var temp = Math.random().toString(36).substr(2, 9); 
			if (!(temp in obj))
				return temp;
		}
	}
					
	function isExisty(obj) {
		return typeof(obj) !== 'undefined' && obj !== null;
	}
	
	function bind(di, context) {
		context.bindBuffer(di.buffers.vertex);
		context.bindBuffer(di.buffers.index);
		context.onUpdate.push(di.update);
	}
	
		
	_G.isExisty = isExisty;
	_G.makeID = makeID;
	_G.bind = bind;
}(this));