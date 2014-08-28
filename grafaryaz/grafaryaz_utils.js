'use strict';

(function(global) {
	var _GY = global.grafaryaz || (global.grafaryaz = {});
	
	var config = {
			samples: 100,
			tol: 0.01,
			samplesPerDOF: 24
		};

	// numerics

	var diffStep = 0.001, tol = 0.001;

	function pow (x, p) {
		var temp = Math.pow(x, p);
		if (!isNaN(temp))
			return temp;
			
		temp = -Math.pow(-x, p);
		if (Math.abs(Math.pow(temp, 1 / p) - x) < .00001)
			return temp;
		
		return NaN;
	};
	
	function seq(a, b, name) {
		a = Number(a);
		b = Number(b);
		return function(data, l) {
			var step = (b - a) / (l - 1);
			for (var i = 0; i < l ; i++)
				data[name][i] = a + i * step;
		}
	}
	
	//this version reuses random
	function traceZeroSet2(f, names) {
		var dof = names.length,
			gradf = grad(f, dof),
			probeSize = 100,
			useProbing = true;
			
		return function(data, l) {
			var s = Date.now();
			var probe = [], 
				res = [],
				mean = [],
				spread = [];
				
			var rand = randomArray(probeSize, dof, 'u'),
				pt = [];
			for (var i = 0; i < probeSize; i++) {
				var row = rand[i];
				for (var j = 0; j < dof; j++)
					pt[j] = 10 * row[j];
				probe.push(newton(pt, f, gradf, false, 100));
			}
			
			for (var j = 0; j < dof; j++) {
				var jmin = probe[0][j],
					jmax = probe[0][j],
					jsum = probe[0][j];
				for (var i = 1; i < probeSize; i++) {
					var val = probe[i][j];
					jmin = Math.min(val, jmin);
					jmax = Math.max(val, jmax);
					jsum += val;
				}
				mean[j] = jsum / probeSize;
				spread[j] = 1.2 * (jmax - jmin);
			}
			console.log(Date.now() - s, 'per probe');
			
			var rand = randomArray(l, dof, 'n'),
				pt = [];
			for (var i = 0; i < l; i++) {
				var row = rand[i];
				for (var j = 0; j < dof; j++)
					pt[j] = mean[j] + spread[j] / 2 * row[j];
				res.push(newton(pt, f, gradf, false, 10));
			}
			
			res.forEach(function(row, i) {
				names.forEach(function(name, j) {
					data[name][i] = row[j];
				});
			});
		}
	}
	
	function traceZeroSet(f, names) {
		var dof = names.length,
			gradf = grad(f, dof),
			probeSize = 100;
			
		return function(data, l) {
			var s = Date.now();
			var probe = [],
				mean = [],
				spread = [];
				
			var pt = [];
			for (var i = 0; i < probeSize; i++) {
				for (var j = 0; j < dof; j++)
					pt[j] = -10 + 20 * Math.random();
				probe.push(newton(pt, f, gradf, false, 100));
			}
			
			for (var j = 0; j < dof; j++) {
				var jmin = probe[0][j],
					jmax = probe[0][j],
					jsum = probe[0][j];
				for (var i = 1; i < probeSize; i++) {
					var val = probe[i][j];
					jmin = Math.min(val, jmin);
					jmax = Math.max(val, jmax);
					jsum += val;
				}
				mean[j] = jsum / probeSize;
				spread[j] = 1.5 * (jmax - jmin);
			}
			console.log('probe stats', mean, spread, dof, probe);
			console.log(Date.now() - s, 'per probe');
			
			var res = probe,
			    pt = [];
			for (var i = probeSize; i < l; i++) {
				for (var j = 0; j < dof; j++)
					pt[j] = mean[j] + spread[j] / 2 * (Math.random() + Math.random() - 1);
				res.push(newton(pt, f, gradf, false, 10));
			}
			
			res.forEach(function(row, i) {
				names.forEach(function(name, j) {
					data[name][i] = row[j];
				});
			});
		}
	}
	
	function randomArray(len, itemsize, mode) {			
		var arr = randomArray.memo[mode],
			randf = randomFuncs[mode],
			memolen = arr.length,
			memoitemsize = randomArray.memo.itemsize[mode];
		if (memoitemsize < itemsize)
			for (var i = 0; i < memolen; i++) {
				var pt = arr[i];
				for (var j = memoitemsize; j < itemsize; j++)
					pt[j] = randf();
			}
		if (memolen < len)
			for (var i = memolen; i < len; i++) {
				var pt = [];
				for (var j = 0; j < itemsize; j++)
					pt[j] = randf();
				arr[i] = pt;
			}
		randomArray.memo.itemsize[mode] = itemsize;
		return arr;
	};
	
	var randomFuncs = {
		'n': function() {
			return -1 + Math.random() + Math.random();
		},
		'u': function() {
			return -1 + 2 * Math.random();
		},
		'i': function(top) {
			return Math.floor(top * Math.random());
		},
	};
	
	randomArray.memo = {
		'n': [],
		'u': [],
		'itemsize': {
			'n': 0, 
			'u': 0
		}
	};

	function grad(fa, nargs) {
		return function(pt, val, out) {
			for (var i = 0; i < nargs; i++) {
				pt[i] += diffStep;
				out[i] = (fa(pt) - val) / diffStep;
				pt[i] -= diffStep;
			}
		};
	}

	function newton(start, f, gradf, acceptNeg, maxIter) {
		var pt = start.slice(),
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

	
	// sets

	function firstMatch(set, callback) {
		for (var i = 0; i <= set.length && !callback(set[i]); i++);
		return set[i];
	}

	function haveCommon(arr1, arr2) {
		return arr1.some(function(e1) {return arr2.indexOf(e1) !== -1;});
	}

	function intersection(pv, cv) {
		return pv.filter(function(e) {
			return cv.indexOf(e) !== -1;
		});
	}

	function union(pv, cv) {
		return pv.concat(cv).reduce(unique, []);
	}

	function unique(pv, cv) {
		if (pv.indexOf(cv) === -1) 
			pv.push(cv);
		return pv;
	}

	function setMinus(l, r) {
		return l.filter(function(el) {return r.indexOf(el) === -1;});
	}

	function isExisty(obj) {
		return typeof(obj) !== 'undefined' && obj !== null;
	}
	
	
	// linear algebra
	function zeroVector(len) {
		var zero = [];
		for (var i = 0; i < len; i++)
			zero[i] = 0;
		return zero;
	}
	
	function dot(a, b) {
		var temp = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			temp += a[i] * b[i];
		return temp;
	}
	
	function norm(a) {
		var norm = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			norm += Math.abs(a[i]);
		return norm;
	}
	
	function dist(a, b) {
		var dist = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			dist += Math.abs(a[i] - b[i]);
		return dist;
	}

	function arraySum(a, b, out) {
		var l = a.length;
		for (var i = 0; i < l; i++)
			out[i] = a[i] + b[i];
	}

	function arrayTimes(n, b, out) {
		var l = b.length;
		for (var i = 0; i < l; i++)
			out[i] = n * b[i];
	}
	
	
	// exports
	
	_GY.seq = seq;
	_GY.traceZeroSet = traceZeroSet;
	_GY.pow = pow;
		
	// these should be in a Set object or something
	_GY.firstMatch = firstMatch;
	_GY.haveCommon = haveCommon;
	_GY.intersection = intersection;
	_GY.config = config;
	_GY.union = union;
	_GY.unique = unique;
	_GY.setMinus = setMinus;
	_GY.isExisty = isExisty;
}(this));