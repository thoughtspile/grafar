'use strict';

(function(global) {
	var _G = global.grafar,
		isExisty = _G.isExisty;
		
	
	var typedArrays = [
		'Float32Array',
		'Uint8Array'
	];
	
	typedArrays.forEach(function(name) {
		if (!isExisty(global[name]))
			global[name] = Array;
	});
	
}(this));