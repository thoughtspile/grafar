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
			gradf = grad(f, dof),
			probeSize = 100;
			
		return function(data, l, extras) {
			var flatData = names.map(function(name) {
					return data[name];
				}),
				mean = [],
				spread = [],
				i = 0, 
				j = 0,
				pt = [];
			
			stats.enter('probe');
			for (i = 0; i < probeSize; i++) {
				pt = [];
				for (j = 0; j < dof; j++)
					pt[j] = -10 + 20 * Math.random();
				newton(pt, f, gradf, false, 100);
				for (j = 0; j < dof; j++)
					flatData[j][i] = pt[j];
			}
			
			for (j = 0; j < dof; j++) {
				var col = flatData[j],
					jmin = Number.POSITIVE_INFINITY,
					jmax = Number.NEGATIVE_INFINITY,
					jsum = 0;
				for (i = 0; i < probeSize; i++) {
					var val = col[i];
					jmin = Math.min(val, jmin);
					jmax = Math.max(val, jmax);
					jsum += val;
				}
				mean[j] = jsum / probeSize;
				spread[j] = 1.5 * (jmax - jmin);
			}
			stats.exit('probe');
			
			pt = [];
			stats.enter('trace');
			for (i = probeSize; i < l; i++) {
				for (j = 0; j < dof; j++)
					pt[j] = mean[j] + spread[j] / 2 * (Math.random() + Math.random() - 1);
				newton(pt, f, gradf, false, 10);
				for (j = 0; j < dof; j++)
					flatData[j][i] = pt[j];
			}
			stats.exit('trace');
			
			extras.continuous = false;
		};
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

	function newton(start, f, gradf, acceptNeg, maxIter) {
		var pt = start,
			tol = config.tol,
			offset = [],
			nabla = [],
			i = 0;
		
		while (true) {
			var val = f(pt);
			gradf(pt, val, nabla);
			if (val === 0)
				return pt;
			arrayTimes(-val / dot(nabla, nabla), nabla, offset);
			if (norm(offset) < tol || i === maxIter)
				return pt;
			arraySum(pt, offset, pt);
			i++;
		}
	}

	
	// exports
	
	_G.seq = seq;
	_G.traceZeroSet = traceZeroSet;
	_G.pow = pow;
}(this));