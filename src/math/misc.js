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
		
	function strToArray (str) {
		if (typeof str === 'string')
			return str.replace(/ /g, '').split(',');
		else 
			return str.filter(isExisty);
	}
	
	function repeatArray(arr, len, times) {
		var buff = arr.subarray(0, len),
			newlen = times * len;
		for (var i = len; i < newlen; i += len)
			arr.set(buff, i);
		return arr;
	}

	function repeatPoints(arr, len, times) {
		for (var i = len - 1, t = len * times - 1; i >= 0; i--) {
			var val = arr[i];
			for (var j = 0; j < times; j++, t--)
				arr[t] = val;
		}
		return arr;
	}
	
	function incArray (arr, by) {
		for (var i = 0; i < arr.length; i++)
			arr[i] += by;
		return arr;
	}
	
	function timesArray (n, arr) {
		for (var i = 0; i < arr.length; i++)
			arr[i] *= n;
		return arr;
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
	_G.asArray = strToArray;
	_G.incArray = incArray;
	_G.timesArray = timesArray;
	_G.repeatArray = repeatArray;
	_G.repeatPoints = repeatPoints;
}(this));