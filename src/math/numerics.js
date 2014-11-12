'use strict';

(function(global) {
	var _G = global.grafar,
		dot = _G.dot,
		norm = _G.norm,
		arraySum = _G.arraySum,
		arrayTimes = _G.arrayTimes,
		config = _G.config.grafaryaz,
		stats = _G.stats;
	
	stats.add('probe').add('trace');
	
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
	
	function seq(a, b, name) {
		a = Number(a);
		b = Number(b);
		return function(data, l, extras) {
			var step = (b - a) / (l - 1);
			for (var i = 0; i < l ; i++)
				data[name][i] = a + i * step;
			extras.continuous = true;
		};
	}
		
	function traceZeroSet(f, names) {
		var dof = names.length,
			tol = config.tol,
			gradf = grad(f, dof),
			probeSize = 100,
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
				pt = [];
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
				spread[j] = 1.5 * (jmax - jmin);
			}
		}
		
		function constructor(data, l, extras) {
			var flatData = names.map(function(name) {
					return data[name];
				}),
				i = 0, 
				j = 0;
				
			var speed = {};
			var s = performance.now();
			estimator(flatData, l);
			speed['est'] = performance.now() - s;
			
			var s = performance.now();
			if (realSize === 0 && !isEmpty) {
				console.log('empty');
				for (var j = 0; j < dof; j++)
					zeros(flatData[j], l);
				needsReshuffle = true;
				isEmpty = true;
				return;
			}
			
			if (realSize !== 0 && needsReshuffle) {
				console.log('reshuffle');
				for (j = 0; j < dof; j++)
					randomize(flatData[j], l, mean[j], spread[j]);
				needsReshuffle = false;
				isEmpty = false;
			}
			speed['check'] = performance.now() - s;
			
			var s = performance.now();
			if (!isEmpty) {
				for (i = 0; i < l; i++) {
					for (j = 0; j < dof; j++)
						pt[j] = flatData[j][i];
					newton(pt, f, gradf, false, 10, 3, function(pt) {
						for (var j = 0; j < dof; j++)
							pt[j] = mean[j] + spread[j] / 2 * (Math.random() + Math.random() - 1);
					});
					if (f(pt) < tol)
						for (var j = 0; j < dof; j++)
							flatData[j][i] = pt[j];
					else
						for (var j = 0; j < dof; j++)
							flatData[j][i] = 0;
				}
			}
			speed['compute'] = performance.now() - s;
				
			extras.continuous = false;
			console.log(speed);
		};
		
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

	function newton(start, f, gradf, acceptNeg, maxIter, attempts, reset) {
		var pt = start,
			tol = config.tol,
			offset = [],
			nabla = [],
			attempt = 0,
			i = 0;
		
		while (true) {
			var val = f(pt);
			gradf(pt, val, nabla);
			if (val === 0)
				return pt;
			arrayTimes(-val / dot(nabla, nabla), nabla, offset);
			if (norm(offset) < tol)
				return pt;
			if (i === maxIter || pt.indexOf(NaN) !== -1) {
				if (attempt < attempts) {
					reset(pt);
					i = 0;
					attempt++;
				} else {
					pt[0] = NaN;
					return pt;
				}
			}
			arraySum(pt, offset, pt);
			i++;
		}
	}

	
	// exports
	
	_G.seq = seq;
	_G.traceZeroSet = traceZeroSet;
	_G.pow = pow;
}(this));