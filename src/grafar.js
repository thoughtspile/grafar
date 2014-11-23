'use strict';

(function(global) {
	var _G = (global.grafar = {}),
		panels = [];
				
	var config = {
		debug: true,
		
		rootGraphId: '$',
		
		minPanelWidth: 600,
		minPanelHeight: 600,
		container: window,
		antialias: true,
		
		axes: ['x', 'y', 'z'],
		axisLength: 2,
		
		particleRadius: 4,
		
		tweenTime: 900,		
		tweenFunction: function(s, e, t) {
			var part = (1 - Math.cos(Math.PI * t / _G.config.tweenTime)) / 2;  // non-local reference
			return s * (1 - part) + e * part;
		},
		
		grafaryaz: {
			samples: 100,
			tol: 0.001,
			samplesPerDOF: 24,
			diffStep: 0.001
		}
	};
		
	var update = function() {
		var len = panels.length;
		for (var i = 0; i < len; i++)
			panels[i].update();
		_G.frameId++;
		global.requestAnimationFrame(update);
	};
	
	function setup(changes, target) {
		target = target || config;
		Object.keys(changes).forEach(function(name) {
			if (target.hasOwnProperty(name))
				if (name !== 'grafaryaz')
					target[name] = changes[name];
				else
					setup(changes[name], config.grafaryaz);
		});
		return _G;
	}
	
	
	// export
	
	_G.config = config;
	_G.panels = panels;
	_G.update = update;
	_G.setup = setup;
	_G.frameId = 0;
	
	update();
}(this));