'use strict';

(function(global) {
	var _G = global.grafar,
		dot = _G.dot,
		norm = _G.norm,
		arraySum = _G.arraySum,
		arrayTimes = _G.arrayTimes,
		config = _G.config.grafaryaz;
	
	
	function zeros(arr, l) {
		for (var i = 0; i < l; i++)
			arr[i] = 0;
		return arr;
	};
	
	function randomize(arr, l, mean, spread) {
		for (var i = 0; i < l; i++)
			arr[i] = mean + spread / 2 * (Math.random() + Math.random() - 1);
	}
	
	function pow (x, p) {
		var temp = Math.pow(x, p);
		if (!isNaN(temp))
			return temp;
			
		temp = -Math.pow(-x, p);
		if (Math.abs(Math.pow(temp, 1 / p) - x) < config.tol)
			return temp;
		
		return NaN;
	}
	
	function constant(valOuter, name) {
		var val = valOuter;
		console.log('create', val);
		return function(data, l, extras) {
			console.log('call C', val);
			for (var i = 0; i < l ; i++)
				data[name][i] = val;
			extras.continuous = true;
		};
	}
	
	function ints(m, name) {
		m = Number(m);
		return function(data, l, extras) {
			for (var i = 0; i < l; i++)
				data[name][i] = m + i;
			extras.continuous = false;
		};
	}
	
	function seq(a, b, name, closed, discrete) {
		a = Number(a);
		b = Number(b);
		discrete = discrete || false;
		var closeFix = (closed === true? 0: 1);
		return function(data, l, extras) {
			var step = (b - a) / (l - closeFix);
			for (var i = 0; i < l; i++)
				data[name][i] = a + i * step;
			extras.continuous = !discrete;
		};
	}
	
	function logseq(a, b, name) {
		a = Number(a);
		b = Number(b);
		var closeFix = (closed === true? 0: 1);
		return function(data, l, extras) {
			console.log('logseq ' + name);
			var step = (b - a) / Math.log(l);
			for (var i = 1; i < l + 1; i++)
				data[name][i] = a + Math.log(i) * step;
			extras.continuous = true;
		};
	}
		
	function traceZeroSet(f, names) {
		var dof = names.length,
			tol = config.tol,
			gradf = grad(f, dof),
			probeSize = 100,
			thisid = Math.random().toFixed(10),
			mean = [],
			spread = [],
			pt = [],
			realSize = 0,
			isEmpty = false,
			needsReshuffle = true;
		
		function estimator(flatData, l) {
			var i = 0, j = 0;
			
			realSize = 0;
			
			for (i = 0; i < probeSize; i++) {
				for (j = 0; j < dof; j++)
					pt[j] = -10 + 20 * Math.random();
				newton(pt, f, gradf, false, 100);
				if (f(pt) < tol) {
					for (var j = 0; j < dof; j++)
						flatData[j][i] = pt[j];
					realSize++;
				}
			}
			
			for (j = 0; j < dof; j++) {
				var col = flatData[j],
					jmin = 1000,
					jmax = -1000,
					jsum = 0;
				for (i = 0; i < realSize; i++) {
					var val = col[i];
					jmin = Math.min(val, jmin);
					jmax = Math.max(val, jmax);
					jsum += val;
				}
				mean[j] = jsum / realSize;
				spread[j] = 2 * (jmax - jmin);
			}
		}
		
		function constructor(data, l, extras) {
			var flatData = names.map(function(name) {
					return data[name];
				}),
				i = 0, 
				j = 0;
				
			//var speed = {};
			var s = performance.now();
			estimator(flatData, l);
			//speed['est'] = performance.now() - s;
			
			//var s = performance.now();
			if (realSize === 0 && !isEmpty) {
				//console.log('empty');
				for (var j = 0; j < dof; j++)
					zeros(flatData[j], l);
				needsReshuffle = true;
				isEmpty = true;
				return;
			}
			
			//console.log(invalids);
			if (true) {//realSize !== 0 && (needsReshuffle || invalids > 15)) {
				//console.log('reshuffle');
				for (j = 0; j < dof; j++)
					randomize(flatData[j], l, mean[j], spread[j]);
				needsReshuffle = false;
				isEmpty = false;
			}
			//speed['check'] = performance.now() - s;
			
			//var s = performance.now();
			if (!isEmpty) {
				for (i = 0; i < l; i++) {
					for (j = 0; j < dof; j++)
						pt[j] = flatData[j][i];
					newton(pt, f, gradf, false, 30);
					for (var j = 0; j < dof; j++)
						flatData[j][i] = pt[j];
				}
			}
			//console.log(performance.now() - s);
				
			extras.continuous = false;
		};
		constructor.id = thisid;
		return constructor;
	}

	function grad(fa, nargs) {
		var diffStep = config.diffStep;
		return function(pt, val, out) {
			for (var i = 0; i < nargs; i++) {
				pt[i] += diffStep;
				out[i] = (fa(pt) - val) / diffStep;
				pt[i] -= diffStep;
			}
		};
	}

	var nabla = [], offset = [];
	function newton(pt, f, gradf, acceptNeg, maxIter) {
		var tol = config.tol,
			val = 0,
			i = 0,
			j = 0,
			posterr = 0,
			l = pt.length;
		
		for (i = 0; i < maxIter; i++) {
			val = f(pt);
			gradf(pt, val, nabla);
			posterr = -val / dot(nabla, nabla);
			for (j = 0; j < l; j++)
				offset[j] = posterr * nabla[j];
			if (norm(offset) < tol)
				return pt;
			for (j = 0; j < l; j++)
				pt[j] += offset[j];
		}
		
		for (j = 0; j < l; j++)
			pt[j] = 0; ////// WWWWWWWWWWWWWWTTTTTTTTTTTTTTFFFFFFFFFFF
		return pt;
	}

	
	// exports
	
	_G.constant = constant;
	_G.ints = ints;
	_G.seq = seq;
	_G.logseq = logseq;
	_G.traceZeroSet = traceZeroSet;
	_G.pow = pow;
}(this));