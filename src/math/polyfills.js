'use strict';

(function(global) {
	var _G = global.grafar;
		
	
	var typedArrays = [
		'Float32Array',
		'Uint8Array'
	];
	
	typedArrays.forEach(function(name) {
	});
	
	window.performance = window.performance || {};
	window.performance.now = 
		window.performance.now ||
		window.performance.mozNow ||
		window.performance.msNow ||
		window.performance.oNow ||
		window.performance.webkitNow ||
		Date.now;
	
}(this));