'use strict';

(function(global) {
	var _G = global.grafar,
		performance = window.performance;
	
			
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
		
	var stats = {
		actions: {},
		clocks: {},
		
		report: function() {
			var temp = {},
				aNames = Object.getOwnPropertyNames(this.actions)
			aNames.forEach(function(actionName) {
					var times = this.actions[actionName].times;
					if (times.length > 0)
						temp[actionName] = {
							max: Math.max.apply(null, times),
							min: Math.min.apply(null, times),
							average: times.reduce(function(pv, cv) { return pv + cv; }, 0) / times.length,
							total: times.reduce(function(pv, cv) { return pv + cv; }, 0),
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
			this.clocks[name] = performance.now();
			return this;
		},
		
		exit: function(name) {
			this.actions[name].times.push(performance.now() - this.clocks[name]);
			return this;
		}
	};
	
	
	_G.stats = stats;
	_G.isExisty = isExisty;
	_G.makeID = makeID;
	_G.bind = bind;
}(this));