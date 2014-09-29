'use strict';

(function(global) {
	var _G = global.grafar;
		
	
	global.Float32Array = global.Float32Array || Array;
	global.Uint32Array = global.Uint32Array || Array;
	global.Uint16Array = global.Uint16Array || Array;
	global.Uint8Array = global.Uint8Array || Array;
	
	global.performance = global.performance || {};
	global.performance.now = 
		global.performance.now ||
		global.performance.mozNow ||
		global.performance.msNow ||
		global.performance.oNow ||
		global.performance.webkitNow ||
		Date.now ||
		function() { return new Date().getTime(); };
	
}(this));