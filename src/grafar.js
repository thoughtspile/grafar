'use strict';

(function(global) {
	var _G = (global.grafar = {});
	
	var stats = {
		actions: {},
		clocks: {},
		
		report: function() {
			var temp = {},
				aNames = Object.getOwnPropertyNames(this.actions)
			aNames.forEach(function(actionName) {
					var times = this.actions[actionName].times;
					temp[actionName] = {
						max: Math.max.apply(null, times),
						min: Math.min.apply(null, times),
						average: times.reduce(function(pv, cv) { return pv + cv; }, 0) / times.length,
						raw: times
					};
				}.bind(this));
			return temp;
		},
		
		add: function(name) {
			this.actions[name] = {
				times: []
			};
			return this;
		},
		
		enter: function(name) {
			this.clocks[name] = Date.now();
			return this;
		},
		
		exit: function(name) {
			this.actions[name].times.push(Date.now() - this.clocks[name]);
			return this;
		}
	};
			
	var config = {
		debug: true,
		
		rootGraphId: '$',
		
		minPanelWidth: 600,
		minPanelHeight: 600,
		container: window,
		antialias: true,
		
		axes: ['x', 'y', 'z'],
		axisLength: 2,
		
		particleRadius: 2,
		
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
		global.requestAnimationFrame(update);
		Object.keys(_G.panels || {}).forEach(function(pan) {
			_G.panels[pan].update();
		});
	};
	
	
	// export
	
	_G.stats = stats;
	_G.config = config;
	_G.update = update;
	
	update();
}(this));