'use strict';

(function(global) {
	var _G = (global.grafar = {});
	
	var stats = {
		frames: 0,
		start: Date.now(),
		get totalTime() {
			return Date.now() - this.start;
		},
		get averageFrameTime() {
			return this.totalTime / this.frames;
		},
		get averageFPS() {
			return 1000 * this.frames / this.totalTime;
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
	
	// export
	
	_G.stats = stats;
	_G.config = config;
}(this));