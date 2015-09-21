'use strict';

(function(global) {
	var _G = global.grafar;


	function isExisty(obj) {
		return typeof(obj) !== 'undefined' && obj !== null;
	}

	function animate(fn) {
		var wrapped = function() {
			var proceed = fn();
			if (proceed)
				window.requestAnimationFrame(wrapped);
		};
		wrapped();
		return grafar;
	};


	_G.isExisty = isExisty;
	_G.animate = animate;
}(this));
