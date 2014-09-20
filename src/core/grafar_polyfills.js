'use strict';

(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	var isExisty = _G.isExisty;
	
	var typedArrays = [
		'Float32Array',
		'Uint8Array'
	];
	
	typedArrays.forEach(function(name) {
		if (!isExisty(gloabl[name]))
			gloabl[name] = Array;
	});
	
}(this));